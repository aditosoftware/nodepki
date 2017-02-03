#!/bin/bash

###
### Generate directory structure
###

mkdir certs crl newcerts private
touch index.txt
echo 1000 > serial


###
### Customize and create openssl.cnf
###

sed 's+{basedir}+'$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)'+' openssl.cnf.tpl > openssl.cnf


###
### Generate Root CA key
###

openssl genrsa -aes256 -out private/ca.key.pem 4096
chmod 400 private/ca.key.pem


###
### Create Root CA certificate
###

openssl req -config openssl.cnf \
      -key private/ca.key.pem \
      -new -x509 -days 7300 -sha256 -extensions v3_ca \
      -out certs/ca.cert.pem
