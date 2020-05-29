
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

quantile_transform <- function(exper) {
  x <- assay(exper)
  for (j in seq_len(nrow(exper))) {
    x[j, ] <- rank(x[j, ]) / ncol(x)
  }

  assay(exper) <- x
  exper
}
