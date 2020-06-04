
unify_row_data <- function(row_data_list) {
  do.call(rbind, row_data_list) %>%
    as_tibble() %>%
    unique() %>%
    arrange(channel_name, marker_name)
}

unify_col_data <- function(col_data_list) {
  col_union <- lapply(col_data_list, function(x) as_tibble(colData(x)))
  bind_rows(col_union, .id="cell_type") %>%
    select(sample_id, starts_with("patient"), everything()) %>%
    select(-file_name) %>%
    mutate_at(vars(matches("Age|percent|Score")), as.numeric) %>%
    mutate_at(vars(-matches("Age|percent|Score")), as_factor)
}

subsample_experiments <- function(x_list, p_keep = 0.05) {
  for (i in seq_along(x_list)) {
    D <- ncol(x_list[[i]])
    sample_ix <- sample(D, D * p_keep, replace=FALSE)
    x_list[[i]] <- x_list[[i]][, sample_ix]
  }
  x_list
}

data_list <- function(pattern) {
  global <- ls(envir=.GlobalEnv)
  cell_types <- global[grep(pattern, global)]
  x <- lapply(cell_types, get)
  names(x) <- cell_types
  x
}

quantile_transform <- function(exper, max_rank = 2000) {
  x <- assay(exper)
  for (j in seq_len(nrow(exper))) {
    x[j, ] <- pmin(rank(x[j, ], ties = "random"), max_rank) / max_rank
  }

  assay(exper) <- x
  exper
}

polygonize <- function(im) {
  polys <- st_as_stars(im) %>%
    st_as_sf(merge = TRUE) %>%
    st_cast("POLYGON")

  colnames(polys)[1] <- "cellLabelInImage"
  polys %>%
    mutate(geometry = st_buffer(geometry, dist = 0)) %>%
    group_by(cellLabelInImage) %>%
    summarise(n_polys = n()) %>%
    dplyr::select(-n_polys)
}

backgroundProp <- function(x, ...) {
  if (nrow(x) == 0) { # case of no neighbors
    return (tibble(immuneGroup = NA, props = NA))
  }

  props <- table(x$cellLabelInImage %in% c(0, 1))
  tibble(background = names(props), props = props / sum(props))
}

typeProps <- function(x, ...) {
  if (nrow(x) == 0) { # case of no neighbors
    return (tibble(cell_type = NA, props = NA))
  }

  props <- table(x$cell_type, useNA = "ifany")
  tibble(cellType = names(props), props = as.numeric(props) / sum(props)) %>%
    filter(props != 0)
}

cell_type <- function(exper) {
  colData(exper) %>%
    as.data.frame() %>%
    dplyr::select(tumor_group, immune_group) %>%
    mutate(
      cell_type = paste0(tumor_group, immune_group),
      cell_type = gsub("not immune", "", cell_type),
      cell_type = gsub("Immune", "", cell_type),
      ) %>%
    .[["cell_type"]] %>%
    as_factor()
}

#' Apply fun to Graph Neighborhoods
#'
#' @param cell_id The ID of the cell to extract a local neighborhood around.
#' @param G The graph object giving the connections between cell_ids.
#' @param polys A spatial data.frame with a column (geometry) giving the spatial
#'   geometry of each cell.
#' @param fun A function that can be applied to a data.frame whose rows are
#'   pixels and whose columns give features of those pixels (e.g., immune
#'   group).
#' @return result A tibble mapping the cell to statistics calculated by fun.
graph_stats_cell <- function(cell_id, G, polys, fun, ...) {
  ball <- igraph::neighbors(G, as.character(cell_id))
  cell_stats <- polys %>%
    filter(cellLabelInImage %in% names(ball)) %>%
    group_map(fun)

  cell_stats[[1]] %>%
    dplyr::mutate(cellLabelInImage = cell_id) %>%
    dplyr::select(cellLabelInImage, everything())
}

extract_graph <- function(labels, geometries, snap = 4) {
  nb <- spdep::poly2nb(geometries, snap = snap)

  relations_data <- list()
  for (i in seq_along(nb)) {
    relations_data[[i]] <- tibble(
      from = labels[i],
      to = c(labels[i], labels[nb[[i]]]) # always have self loop
    )
  }

  relations_data <- bind_rows(relations_data)
  igraph::graph_from_data_frame(relations_data, labels)
}

#' Apply fun to Local Neighborhoods
#'
#' @param cell_id The ID of the cell to extract a local neighborhood around.
#' @param im The raster object giving the pixel-level information about the
#'   sample.
#' @param polys A spatial data.frame with a column (geometry) giving the spatial
#'   geometry of each cell.
#' @param fun A function that can be applied to a data.frame whose rows are
#'   pixels and whose columns give features of those pixels (e.g., immune
#'   group).
#' @param buffer_radius The size of the window around cell_id, to use to subset
#'   the raster on which to apply fun.
#' @param plot_masks If you want to see what the subsets of cells looks like,
#'   you can use this.
#' @return result A tibble mapping the cell to statistics calculated by fun.
raster_stats_cell <- function(cell_id, im, polys, fun, buffer_radius=90,
                              plot_masks=TRUE) {
  sub_poly <- polys %>%
    filter(cellLabelInImage == cell_id) %>%
    .[["geometry"]] %>%
    st_centroid() %>%
    st_buffer(dist=buffer_radius)

  im_ <- mask(im, as_Spatial(sub_poly))
  if (plot_masks) {
    plot(im_)
  }

  melted_im <- as.matrix(im_) %>%
    melt(na.rm=TRUE, value.name = "cellLabelInImage") %>%
    left_join(polys, by = "cellLabelInImage") %>%
    group_map(fun)

  melted_im[[1]] %>%
    mutate(cellLabelInImage = cell_id) %>%
    dplyr::select(cellLabelInImage, everything())
}

#' Wrapper for Local Statistics
#'
#' @param cell_ids A vector of cell IDs on which to apply a function to
#' @param type Either "raster" or "graph". Specifies the types of neighborhoods
#'   (image or graph) on which to compute statistics.
loop_stats <- function(cell_ids, type="raster", ...) {
  cell_fun <- ifelse(type == "raster", raster_stats_cell, graph_stats_cell)

  result <- list()
  for (i in seq_along(cell_ids)) {
    result[[i]] <- cell_fun(cell_ids[i], ...)
  }

  bind_rows(result)
}

generate_model <- function(n_ft) {
  keras_model_sequential() %>%
    layer_dense(units = 32, input_shape = n_ft) %>%
    layer_activation('relu') %>%
    layer_dense(units = 32, input_shape = 32) %>%
    layer_activation('relu') %>%
    layer_dense(units = 32, input_shape = 32) %>%
    layer_activation('relu') %>%
    layer_dense(units = 32, input_shape = 32) %>%
    layer_activation('relu') %>%
    layer_dense(units = 32, input_shape = 32) %>%
    layer_activation('relu') %>%
    layer_dense(units = 2) %>%
    compile(optimizer = optimizer_adam(lr=1e-2), loss = "mae")
}
