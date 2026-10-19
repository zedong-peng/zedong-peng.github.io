## how to run locally

```
docker compose up --detach

# wait until the first build finishes, then open http://localhost:8080
docker compose logs -f jekyll

docker compose down
```

## how to update cv

Edit `_data/cv.yml` (publications come from `_bibliography/papers.bib`). The page `/cv/` renders it, and the deploy workflow prints that page to `/assets/pdf/Zedong_Peng_CV.pdf`.
