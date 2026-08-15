# Bug Report

## Bug 1: Pagination Returns Incorrect Results

### Location

`src/services/taskService.js`

### Problem

The `getPaginated()` function calculated the pagination offset incorrectly.

The original implementation was:

```javascript
const offset = page * limit;


---

# Run the final tests

Run:

```bash
npm test