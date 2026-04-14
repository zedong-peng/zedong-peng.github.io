## how to run locally
```
docker compose up --detach

# wait until the first build finishes, then open http://localhost:8080
docker compose logs -f jekyll

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
