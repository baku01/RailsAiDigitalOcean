#!/bin/bash

# Script para deploy de projeto Rails no Heroku com configuração de variáveis ENV

set -e

echo "===> Checando dependências..."
command -v heroku >/dev/null 2>&1 || { echo "Heroku CLI não encontrado. Instale antes de continuar."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git não encontrado. Instale antes de continuar."; exit 1; }

if grep -q "sqlite3" Gemfile; then
  echo "ATENÇÃO: Remova sqlite3 do Gemfile para produção e use 'pg' (PostgreSQL)!"
  exit 1
fi

echo "===> Fazendo login no Heroku..."
heroku login

echo "===> Inicializando repositório Git (se necessário)..."
git init
git add .
git commit -m "Deploy inicial" || echo "Commit já existe."

echo "===> Criando app no Heroku..."
APP_NAME=${1:-}
if [ -z "$APP_NAME" ]; then
  heroku create
else
  heroku create "$APP_NAME"
fi

echo "===> Garantindo buildpack Ruby..."
heroku buildpacks:set heroku/ruby

echo "===> Solicitando variáveis de ambiente para produção..."

read -p "Informe o valor de DIGITAL_OCEAN_API: " DIGITAL_OCEAN_API
read -p "Informe o valor de CONSULT_URL: " CONSULT_URL
read -p "Informe o valor de AWSER_URL: " AWSER_URL

# Variáveis opcionais para performance
read -p "Informe o valor de WEB_CONCURRENCY (pressione Enter para padrão): " WEB_CONCURRENCY
read -p "Informe o valor de PIDFILE (pressione Enter para padrão): " PIDFILE

echo "===> Configurando variáveis no Heroku..."
heroku config:set DIGITAL_OCEAN_API="$DIGITAL_OCEAN_API"
heroku config:set CONSULT_URL="$CONSULT_URL"
heroku config:set AWSER_URL="$AWSER_URL"

if [ ! -z "$WEB_CONCURRENCY" ]; then
  heroku config:set WEB_CONCURRENCY="$WEB_CONCURRENCY"
fi
if [ ! -z "$PIDFILE" ]; then
  heroku config:set PIDFILE="$PIDFILE"
fi

echo "===> Fazendo push para o Heroku..."
git push heroku main || git push heroku master

echo "===> Rodando migrations..."
heroku run rails db:migrate

echo "===> Abrindo o app no navegador..."
heroku open

echo "===> Deploy finalizado com sucesso!"
