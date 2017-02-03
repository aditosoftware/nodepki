#!/bin/bash

STARTDIR=$(pwd)
BASEDIR=$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)

echo "Scriptdir: "${BASEDIR}
cd $BASEDIR

###
### Generate directory structure
###
echo ">>> Creating directories"
mkdir certs crl newcerts private
touch index.txt
echo 1000 > serial


###
### Customize and create openssl.cnf
###

echo ">>> Creating openssl.cnf"
sed 's+{basedir}+'${SCRIPTDIR}'+' openssl.cnf.tpl > openssl.cnf


###
### Generate Root CA key
###

echo ">>> Creating Root CA key"
openssl genrsa -aes256 -out private/ca.key.pem 4096
chmod 600 private/ca.key.pem


###
### Create Root CA certificate
###

echo ">>> Creating Root certificate"
openssl req -config openssl.cnf \
      -key private/ca.key.pem \
      -new -x509 -days 7300 -sha256 -extensions v3_ca \
      -out certs/ca.cert.pem


cd $STARTDIR

printf "\r\n\
##################################################################\r\n\
####                                                          ####\r\n\
####      !!! Make an external backup of mpki/ NOW !!!        ####\r\n\
####                                                          ####\r\n\
##################################################################\r\n\r\n"
