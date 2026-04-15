# Care Privacy Notice: Front End Clinician Dashboard With HTML

## Overview

A plain HTML dashboard displaying care privacy notice acknowledgment data in a sortable, filterable table. Falls back to sample data when the backend API is unavailable.

## Architecture

- Plain table with 5 columns: Patient Name, NHS Number, Date Acknowledged, Status, Practice Name
- Click column headers to sort (ascending/descending toggle with visual indicators)
- Filter bar: text search (name, NHS number, practice), status dropdown, clear button
- Status badges with color coding (green=complete, red=incomplete)
- XSS protection via DOM-based text escaping
- Falls back to sample data if backend API is unavailable
- ES module pattern

## Usage

Open index.html directly in a browser. No build step or server required.
