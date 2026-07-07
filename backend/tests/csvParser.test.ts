import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import { parseCSV } from '../src/services/csvParser';

describe('csvParser', () => {
  it('parses a basic CSV stream correctly', async () => {
    const csvContent = `name,age,email\nAlice,30,alice@test.com\nBob,25,bob@test.com`;
    const stream = Readable.from(Buffer.from(csvContent));
    
    const records = await parseCSV(stream);
    
    expect(records.length).toBe(2);
    expect(records[0]).toEqual({ name: 'Alice', age: '30', email: 'alice@test.com' });
    expect(records[1]).toEqual({ name: 'Bob', age: '25', email: 'bob@test.com' });
  });

  it('handles empty streams gracefully', async () => {
    const stream = Readable.from(Buffer.from(''));
    const records = await parseCSV(stream);
    expect(records.length).toBe(0);
  });

  it('handles messy headers and spacing', async () => {
    const csvContent = `  first Name , Last_Name\n  John  , Doe  \n`;
    const stream = Readable.from(Buffer.from(csvContent));
    
    const records = await parseCSV(stream);
    expect(records.length).toBe(1);
    expect(records[0]).toEqual({ 'first Name': 'John', Last_Name: 'Doe' });
  });
});
