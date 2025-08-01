import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import App from './App';

// Helper to switch to Script Validator tab
function switchToValidator() {
  fireEvent.click(screen.getByTestId('tab-validator'));
}

describe('App UI', () => {
  test('renders Query Supporting Tool header', () => {
    render(<App />);
    expect(screen.getByText('Query Supporting Tool')).toBeInTheDocument();
  });

  test('tab switching works', () => {
    render(<App />);
    // Check that the DB Script Generator tab header is present
    expect(screen.getByRole('heading', { name: /db script generator/i })).toBeInTheDocument();
    // Switch to Script Validator
    fireEvent.click(screen.getByTestId('tab-validator'));
    // Check that the Script Validator tab header is present
    expect(screen.getByRole('heading', { name: /script validator/i })).toBeInTheDocument();
  });

  test('validate button shows error for empty script', () => {
    render(<App />);
    switchToValidator();
    fireEvent.click(screen.getByText('Validate'));
    expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
  });

  test('validate button accepts valid CREATE TABLE script', () => {
    render(<App />);
    switchToValidator();
    const textarea = screen.getByPlaceholderText(/paste your sql script/i);
    fireEvent.change(textarea, {
      target: { value: 'CREATE TABLE student(\n id INT NOT NULL PRIMARY KEY,\n names VARCHAR(255),\n address VARCHAR(255)\n)'}
    });
    fireEvent.click(screen.getByText('Validate'));
    expect(screen.getByText(/script is valid/i)).toBeInTheDocument();
  });

  test('validate button shows error for unsupported datatype', () => {
    render(<App />);
    switchToValidator();
    const textarea = screen.getByPlaceholderText(/paste your sql script/i);
    fireEvent.change(textarea, {
      target: { value: 'CREATE TABLE t(x FAKETYPE)'}
    });
    fireEvent.click(screen.getByText('Validate'));
    // Use a custom matcher for better robustness
    const result = screen.getByText((content) => /unsupported datatype/i.test(content));
    expect(result).toBeInTheDocument();
  });

  test('Add Column button adds a new column row', () => {
    render(<App />);
    expect(screen.getByText('Add Column')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Add Column'));
    // There should be at least two input fields for column name now
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(1);
  });

  test('Generate Script button generates script', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Database Name/i), { target: { value: 'testdb' } });
    fireEvent.change(screen.getByLabelText(/Table Name/i), { target: { value: 'testtable' } });
    fireEvent.click(screen.getByText('Generate Script'));
    expect(screen.getByTestId('output-script').value).not.toBe('');
  });
});
