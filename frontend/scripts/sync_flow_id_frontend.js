#!/usr/bin/env node
/**
 * Frontend Flow ID Sync Helper
 * Reads Flow ID from shared data directory and updates frontend files
 */

const fs = require('fs');
const path = require('path');

function log(message) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[${timestamp}] ${message}`);
}

function readFlowIdFromData() {
    try {
        // Check for flow ID from uploader
        const flowIdFile = '/app/data/flow_id.txt';
        if (fs.existsSync(flowIdFile)) {
            const flowId = fs.readFileSync(flowIdFile, 'utf8').trim();
            if (flowId) {
                return flowId;
            }
        }
        
        // Check for sync data from flow_sync container
        const syncFile = '/app/data/frontend_sync.json';
        if (fs.existsSync(syncFile)) {
            const syncData = JSON.parse(fs.readFileSync(syncFile, 'utf8'));
            return syncData.flow_id;
        }
        
        return null;
        
    } catch (error) {
        log(`Error reading Flow ID from data: ${error.message}`);
        return null;
    }
}

function updateLangflowApiFile(flowId) {
    try {
        const apiFile = '/app/src/services/langflowApi.ts';
        
        if (!fs.existsSync(apiFile)) {
            log('langflowApi.ts not found, skipping update');
            return false;
        }
        
        // Read file content
        let content = fs.readFileSync(apiFile, 'utf8');
        
        // Replace Flow ID pattern
        const pattern = /this\.flowId = '[^']+'/g;
        const replacement = `this.flowId = '${flowId}'`;
        
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            
            // Write back to file
            fs.writeFileSync(apiFile, content, 'utf8');
            
            log(`Updated langflowApi.ts with Flow ID: ${flowId}`);
            return true;
        } else {
            log('Could not find Flow ID pattern in langflowApi.ts');
            return false;
        }
        
    } catch (error) {
        log(`Failed to update langflowApi.ts: ${error.message}`);
        return false;
    }
}

function main() {
    try {
        const flowId = readFlowIdFromData();
        if (flowId) {
            if (updateLangflowApiFile(flowId)) {
                log('Frontend Flow ID sync completed successfully');
            } else {
                log('Failed to update frontend files');
                process.exit(1);
            }
        } else {
            log('No Flow ID found in shared data directory');
            // Don't exit with error as this might be normal during first run
        }
        
    } catch (error) {
        log(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
