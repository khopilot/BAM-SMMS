#!/bin/bash

# BAM APP - Social Media Management Tool
# Automatic Installation Script for macOS
# Version: 2.0.0 (Fully Responsive Edition)
# Updated: May 30, 2025

set -e

echo "🚀 BAM APP - Social Media Management Tool"
echo "========================================="
echo "Version: 2.0.0 (Fully Responsive Edition)"
echo "Building Amazing Media content with Hugo & Brett"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This installer is designed for macOS only.${NC}"
    exit 1
fi

# Check for required permissions
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check if Applications folder is writable
if [ ! -w "/Applications" ]; then
    echo -e "${YELLOW}⚠️  Administrator privileges required to install to /Applications${NC}"
    echo "Please enter your password when prompted."
fi

echo -e "${GREEN}✅ System requirements met${NC}"
echo ""

# Installation options
echo -e "${YELLOW}📦 BAM APP Installation Options:${NC}"
echo "1) Install BAM APP.app to Applications folder (Recommended)"
echo "2) Run BAM APP from current location"
echo "3) View installation information"
echo "4) Exit"
echo ""

read -p "Please select an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}📱 Installing BAM APP to Applications...${NC}"
        
        # Remove existing installation if it exists
        if [ -d "/Applications/BAM APP.app" ]; then
            echo "Removing existing BAM APP installation..."
            sudo rm -rf "/Applications/BAM APP.app"
        fi
        
        # Copy the app
        if [ -d "BAM APP.app" ]; then
            sudo cp -R "BAM APP.app" "/Applications/"
            sudo chown -R root:admin "/Applications/BAM APP.app"
            sudo chmod -R 755 "/Applications/BAM APP.app"
            
            echo -e "${GREEN}✅ BAM APP installed successfully!${NC}"
            echo ""
            echo -e "${YELLOW}🎉 What's New in Version 2.0.0 (Fully Responsive):${NC}"
            echo "• 📱 100% Mobile & Tablet Responsive Design"
            echo "• 🎨 Enhanced BAM Branding with Custom Colors"
            echo "• 📺 Smart Video Aspect Ratio Selection (9:16 vs 16:9)"
            echo "• 🎯 Optimized for TikTok, YouTube, Instagram & Facebook"
            echo "• 📊 Improved Analytics Dashboard"
            echo "• 🎨 Advanced Brand Identity Management"
            echo "• 🚀 Better Content Assistant with AI Features"
            echo "• 👥 Enhanced Freelancer Workflow Management"
            echo ""
            echo -e "${GREEN}🚀 Launch BAM APP from:${NC}"
            echo "• Applications folder"
            echo "• Spotlight search (⌘ + Space, then type 'BAM APP')"
            echo "• Dock (if you add it to your dock)"
            echo ""
            
            read -p "Would you like to open BAM APP now? (y/n): " open_now
            if [[ $open_now =~ ^[Yy]$ ]]; then
                echo "Opening BAM APP..."
                open "/Applications/BAM APP.app"
            fi
        else
            echo -e "${RED}❌ BAM APP.app not found in current directory${NC}"
            echo "Please ensure BAM APP.app is in the same folder as this script."
            exit 1
        fi
        ;;
    2)
        echo ""
        echo -e "${BLUE}🏃 Running BAM APP from current location...${NC}"
        if [ -d "BAM APP.app" ]; then
            open "BAM APP.app"
            echo -e "${GREEN}✅ BAM APP launched!${NC}"
        else
            echo -e "${RED}❌ BAM APP.app not found in current directory${NC}"
            exit 1
        fi
        ;;
    3)
        echo ""
        echo -e "${BLUE}ℹ️  BAM APP - Installation Information${NC}"
        echo "======================================"
        echo ""
        echo -e "${YELLOW}About BAM APP:${NC}"
        echo "• Complete Social Media Management Tool"
        echo "• Built with Tauri (Rust + React + TypeScript)"
        echo "• Fully responsive design for all devices"
        echo "• Optimized for TikTok, YouTube, Instagram & Facebook"
        echo "• Features: Video Management, Analytics, Brand Identity, Content Assistant"
        echo ""
        echo -e "${YELLOW}System Requirements:${NC}"
        echo "• macOS 10.15 (Catalina) or later"
        echo "• Apple Silicon (M1/M2) or Intel processor"
        echo "• 100MB+ free disk space"
        echo ""
        echo -e "${YELLOW}Version 2.0.0 Features:${NC}"
        echo "• 📱 Mobile-First Responsive Design"
        echo "• 🎨 BAM Brand Colors (#FA1F15, #1F31C7, #FEC802)"
        echo "• 📺 Intelligent Aspect Ratio Selection"
        echo "• 🎯 Platform-Specific Optimization"
        echo "• 📊 Advanced Analytics & Real-time Data"
        echo "• 🎨 Professional Brand Identity Tools"
        echo "• 🤖 AI-Powered Content Assistant"
        echo "• 👥 Comprehensive Freelancer Management"
        echo ""
        echo -e "${YELLOW}Support:${NC}"
        echo "• Built for Hugo & Brett's content creation needs"
        echo "• Optimized for viral content and engagement"
        echo "• Professional social media management workflows"
        echo ""
        ;;
    4)
        echo ""
        echo -e "${YELLOW}👋 Installation cancelled. BAM APP is ready when you are!${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}❌ Invalid option. Please run the script again and select 1-4.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Thank you for installing BAM APP!${NC}"
echo -e "${BLUE}🚀 Ready to create amazing content with Hugo & Brett's social media management tool!${NC}"
echo "" 