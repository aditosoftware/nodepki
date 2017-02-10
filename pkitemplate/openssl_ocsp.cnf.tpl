[ req ]
default_bits        = 2048
distinguished_name  = req_distinguished_name
string_mask         = utf8only

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha256

prompt = no


[ req_distinguished_name ]
C={country}
ST={state}
L={locality}
O={organization}
CN={commonname}
