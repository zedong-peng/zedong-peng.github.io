## how to run locally
```
docker compose up --detach

docker compose exec jekyll bundle

docker compose restart jekyll

# open http://localhost:8080

docker compose down
```
## how to update cv

use https://docs.rendercv.com/user_guide/ as yaml_cv engine

first time:
```
pip install "rendercv[full]"

rendercv new "Your Full Name"
```
for update:
```
cd assets/pdf/yaml_cv

rendercv render "Zedong_Peng_CV.yaml"
```
or 
```
rendercv render --watch "Zedong_Peng_CV.yaml"
```