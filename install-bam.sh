#!/bin/bash

# BAM APP - Installation Script
# This script will download and install BAM APP automatically

set -e

APP_NAME="BAM APP"
DMG_NAME="BAM-SMMS-Installer.dmg"
MOUNT_DIR="/Volumes/${APP_NAME}"
APP_DIR="/Applications"

echo "🚀 Installing ${APP_NAME}..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if DMG exists
if [ ! -f "${DMG_NAME}" ]; then
    echo "❌ Error: ${DMG_NAME} not found in current directory"
    exit 1
fi

echo "📁 Mounting disk image..."
hdiutil attach "${DMG_NAME}" -quiet

echo "📦 Installing application..."
# Copy app to Applications folder
cp -R "${MOUNT_DIR}/BAM APP.app" "${APP_DIR}/"

echo "🧹 Cleaning up..."
# Unmount the DMG
hdiutil detach "${MOUNT_DIR}" -quiet

echo "✅ ${APP_NAME} installed successfully!"
echo "🎉 You can now find it in your Applications folder"
echo ""
echo "To launch the app:"
echo "   • Press Cmd+Space and type 'BAM APP'"
echo "   • Or go to Applications folder and double-click the app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 BAM APP - Social Media Management Tool is ready to use!"

# Optional: Launch the app immediately
read -p "🚀 Would you like to launch the app now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "${APP_DIR}/BAM APP.app"
    echo "🎊 App launched! Enjoy BAM APP!"
fi 