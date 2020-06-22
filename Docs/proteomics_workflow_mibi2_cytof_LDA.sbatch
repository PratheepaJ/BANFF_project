#!/bin/bash
#
#SBATCH --job-name=proteomics_workflow_mibi2_cytof_LDA_%j
#SBATCH --output=proteomics_workflow_mibi2_cytof_LDA_%j.out
#SBATCH --error=proteomics_workflow_mibi2_cytof_LDA_%j.err
#SBATCH --partition=normal
#SBATCH --qos=normal
#SBATCH --time=32:00:00
#SBATCH --nodes=1
#SBATCH --mem=30G

module load R/3.6.1 boost/1.69.0

rmd_filename=$1
K=$2
R=$3
R -e "rmarkdown::render('${rmd_filename}', params=list(K = ${K}, R = ${R}))"
