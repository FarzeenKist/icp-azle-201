#!/usr/bin/env bash

dfx deploy internet_identity

sed -i '' /^IDENTITY_CANISTER_ID/d .env
dfx canister id internet_identity | awk '{print "IDENTITY_CANISTER_ID="$1}' >> .env
