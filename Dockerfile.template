FROM resin/raspberrypi2-node:7.4.0

RUN apt-get update && apt-get install -yq \
   alsa-utils libasound2-dev && \
   apt-get clean && rm -rf /var/lib/apt/lists/*
   RUN apt-get update && apt-get install -y --no-install-recommends \
       bzr \
       git \
       mercurial \
       openssh-client \
       subversion \
       procps \
       autoconf \
       automake \
       bzip2 \
       file \
       g++ \
       gcc \
       imagemagick \
       libbz2-dev \
       libc6-dev \
       libcurl4-openssl-dev \
       libevent-dev \
       libffi-dev \
       libgeoip-dev \
       libglib2.0-dev \
       libjpeg-dev \
       liblzma-dev \
       libmagickcore-dev \
       libmagickwand-dev \
       libmysqlclient-dev \
       libncurses-dev \
       libpng-dev \
       libpq-dev \
       libreadline-dev \
       libsqlite3-dev \
       libssl-dev \
       libtool \
       libwebp-dev \
       libxml2-dev \
       libxslt-dev \
       libyaml-dev \
       make \
       patch \
       xz-utils \
       zlib1g-dev \
     && rm -rf /var/lib/apt/lists/* \
     && apt-get clean


# Defines our working directory in container
WORKDIR /usr/src/app

# Copies the package.json first for better cache on later pushes
COPY package.json package.json

RUN JOBS=MAX npm install --production --unsafe-perm && npm cache clean && rm -rf /tmp/*

# This will copy all files in our root to the working  directory in the container
COPY . ./

# Enable systemd init system in container
ENV INITSYSTEM on

RUN npm run tsc
# app.js will run when container starts up on the device
CMD ["node", "app.js"]
EXPOSE 8080
EXPOSE 8000