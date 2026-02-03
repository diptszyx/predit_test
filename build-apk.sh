 #!/bin/bash
set -e

ANDROID_DIR="./android-app"

if ! command -v bubblewrap &> /dev/null; then
    npm i -g @bubblewrap/cli
fi

if [ ! -d "$ANDROID_DIR" ]; then
    read -p "Enter your PWA URL: " PWA_URL
    [ -z "$PWA_URL" ] && { echo "Error: PWA URL required!"; exit 1; }
    mkdir -p "$ANDROID_DIR"
    cd "$ANDROID_DIR"
    bubblewrap init --manifest "${PWA_URL%/}/manifest.webmanifest"
    cd ..
    echo "IMPORTANT: Edit $ANDROID_DIR/app/build.gradle and add: resConfigs \"en\""
    exit 0
fi

cd "$ANDROID_DIR"
bubblewrap update
bubblewrap build
cd ..
