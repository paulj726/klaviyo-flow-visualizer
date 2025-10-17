# Google Sheets Export Setup Guide

This guide will walk you through setting up the Google Sheets API integration so you can export your Klaviyo flows to a shareable Google Sheet.

## Overview

The Google Sheets export feature will:
- Create a new Google Sheet with all your flow data
- Include email screenshots in the sheet
- Format the data in an easy-to-read table
- Make the sheet shareable with your team

## Prerequisites

- A Google Cloud account (free tier works fine)
- The Google Sheets export button is already added to your Flow Visualizer

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top, then "New Project"
3. Name your project (e.g., "Klaviyo Flow Exporter")
4. Click "Create"

### 2. Enable the Google Sheets API

1. In your new project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and then click "Enable"

### 3. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Service account name: `klaviyo-flow-exporter`
   - Service account ID: (auto-filled)
   - Description: "Service account for exporting Klaviyo flows to Google Sheets"
4. Click "Create and Continue"
5. Skip the optional permissions (click "Continue", then "Done")

### 4. Create and Download a Key

1. In the "Credentials" page, find your new service account in the list
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Click "Create"
7. A JSON file will be downloaded to your computer

### 5. Add the Service Account Key to Your Environment

1. Open the downloaded JSON file in a text editor
2. Copy the entire contents (it should start with `{"type":"service_account",...}`)
3. Open your `.env` file in the project
4. Add a new line:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY=<paste the entire JSON here as a single line>
   ```

   Example:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"klaviyo-flow-exporter-12345","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"klaviyo-flow-exporter@klaviyo-flow-exporter-12345.iam.gserviceaccount.com",...}
   ```

### 6. Add the Environment Variable to Vercel

Since you're deploying on Vercel, you need to add this to your production environment:

```bash
# Copy your entire service account JSON (make sure it's on one line)
echo '<your-json-here>' | npx vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production
```

Or add it through the Vercel dashboard:
1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add a new variable:
   - Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: (paste the entire JSON as a single line)
   - Environment: Production

### 7. Deploy and Test

1. Deploy your updated application:
   ```bash
   npx vercel --prod
   ```

2. Visit your production URL and click "📊 Export to Google Sheets"

3. Wait 1-2 minutes for the export to complete

4. A new Google Sheet will open in a new tab!

## Sharing the Google Sheet

After the export completes, you'll have a new Google Sheet with all your flow data. To share it with your team:

1. Open the Google Sheet
2. Click the "Share" button in the top-right
3. Add team members by email or change permissions to "Anyone with the link"

## Sheet Format

The exported Google Sheet includes:

- **Flow Overview** tab with all flows and emails in a table:
  - Flow Name
  - Status
  - Email # (sequence number)
  - Email Name
  - Delay (when the email is sent)
  - Screenshot (visual preview with IMAGE formula)
  - Open/Click/Conversion rates
  - Direct link to edit in Klaviyo

- **Instructions** tab with metadata and last updated timestamp

## Troubleshooting

### Error: "Google service account not configured"

Make sure you've added the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable and redeployed.

### Error: "Failed to create spreadsheet"

- Verify your service account JSON is valid
- Make sure the Google Sheets API is enabled in your project
- Check that the JSON is on a single line in your .env file

### Sheets are created but I can't see them

The sheets are created by the service account, so they'll appear in the service account's Google Drive (which you can't access directly). However, the sheet URL will be returned and opened automatically. You can then move it to your own Drive or share it as needed.

### Permission denied errors

Make sure your service account has the Google Sheets API enabled and the credentials JSON is correctly formatted.

## Cost

The Google Sheets API is free for:
- Up to 500 requests per 100 seconds per project
- Up to 100 requests per 100 seconds per user

This is more than enough for typical usage of this tool.

## Security Notes

- Keep your service account JSON file secure - it's like a password
- Don't commit the JSON to version control (it's in `.gitignore`)
- The service account can only create and modify sheets, not access your personal files
- You can revoke access anytime by deleting the service account in Google Cloud Console
