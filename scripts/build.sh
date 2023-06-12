set -xe

VERSION=1.4.0

echo "{ \"version\": \"$VERSION\", \"commit\": \"$(git rev-parse HEAD)\" }" > ../public/version.json

docker build -t harbor.k8s.inpt.fr/net7/loca7:$VERSION ../
docker push harbor.k8s.inpt.fr/net7/loca7:$VERSION
