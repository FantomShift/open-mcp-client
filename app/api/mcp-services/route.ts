import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// This is a simplified list of MCP services with their icons
// In a production app, you would scrape this from Composio using Firecrawl
const MCP_SERVICES = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Connect to Gmail to send and manage emails.",
    category: "Collaboration & Communication",
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/gmail_48dp.png",
    isPopular: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "GitHub is a code hosting platform for version control and collaboration, offering Git-based repository management, issue tracking, and continuous integration features",
    category: "Developer Tools & DevOps",
    iconUrl: "https://github.githubassets.com/favicons/favicon.svg",
    isPopular: true,
  },
  {
    id: "googledrive",
    name: "Google Drive",
    description: "Connect to Google Drive!",
    category: "Document & File Management",
    iconUrl: "https://ssl.gstatic.com/images/branding/product/2x/drive_48dp.png",
    isPopular: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Slack is a channel-based messaging platform. With Slack, people can work together more effectively, connect all their software tools and services.",
    category: "Collaboration & Communication", 
    iconUrl: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack.svg",
    isPopular: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Notion centralizes notes, docs, wikis, and tasks in a unified workspace, letting teams build custom workflows for collaboration and knowledge management",
    category: "Productivity & Project Management",
    iconUrl: "https://www.notion.so/front-static/favicon.ico",
    isPopular: true,
  },
  {
    id: "googlesheets",
    name: "Google Sheets",
    description: "Google Sheets is a web-based spreadsheet program that is part of the Google Drive office suite.",
    category: "Productivity & Project Management",
    iconUrl: "https://ssl.gstatic.com/images/branding/product/2x/sheets_48dp.png",
    isPopular: true,
  },
  {
    id: "discord",
    name: "Discord",
    description: "An instant messaging and VoIP social platform.",
    category: "Collaboration & Communication",
    iconUrl: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg",
    isPopular: true,
  },
  {
    id: "jira",
    name: "Jira",
    description: "A tool for bug tracking, issue tracking, and agile project management.",
    category: "Productivity",
    iconUrl: "https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png",
    isPopular: false,
  },
  {
    id: "asana",
    name: "Asana",
    description: "Tool to help teams organize, track, and manage their work.",
    category: "Productivity",
    iconUrl: "https://d1gwm4cf8hecp4.cloudfront.net/images/default/asana-symbol.svg",
    isPopular: false,
  },
  {
    id: "googlemeet",
    name: "Google Meet",
    description: "Google Meet is a video conferencing tool developed by Google.",
    category: "Collaboration & Communication",
    iconUrl: "https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-96dp/logo_meet_2020q4_color_2x_web_96dp.png",
    isPopular: false,
  },
  {
    id: "firecrawl",
    name: "Firecrawl",
    description: "Firecrawl automates web crawling and data extraction, enabling organizations to gather content, index sites, and gain insights from online sources at scale",
    category: "Analytics & Data",
    iconUrl: "https://mcp.composio.dev/firecrawl.svg",
    isPopular: false,
  },
];

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // In a real implementation, this would use Firecrawl to scrape services from Composio
    // For now, return our predefined list
    return NextResponse.json({
      services: MCP_SERVICES
    });
    
  } catch (error) {
    console.error('Error fetching MCP services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
} 