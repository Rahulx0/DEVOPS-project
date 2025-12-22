import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Chatbot from './Chatbot';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Chatbot Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    vi.stubEnv('VITE_NVIDIA_API_KEY', 'test-api-key');
  });

  it('should render chat button', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    expect(chatButton).toBeInTheDocument();
  });

  it('should open chat window when button is clicked', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    expect(screen.getByText('UrbanGear Assistant')).toBeInTheDocument();
    expect(screen.getByText('Always here to help')).toBeInTheDocument();
  });

  it('should show welcome message when chat opens', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    expect(screen.getByText(/Welcome to UrbanGear/i)).toBeInTheDocument();
  });

  it('should close chat window when button is clicked again', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);
    
    expect(screen.getByText('UrbanGear Assistant')).toBeInTheDocument();

    fireEvent.click(chatButton);
    
    expect(screen.queryByText('UrbanGear Assistant')).not.toBeInTheDocument();
  });

  it('should have input field for messages', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    expect(input).toBeInTheDocument();
  });

  it('should update input value when typing', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(input).toHaveValue('Hello');
  });

  it('should have send button', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => btn.className.includes('rounded-full') && !btn.className.includes('fixed'));
    expect(sendButton).toBeInTheDocument();
  });

  it('should disable send button when input is empty', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => 
      btn.className.includes('rounded-full') && 
      btn.className.includes('disabled:opacity-50') &&
      !btn.className.includes('fixed')
    );
    
    expect(sendButton).toBeDisabled();
  });

  it('should send message and display user message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Hello! How can I help?' } }]
      })
    });

    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('should display assistant response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Hello! How can I help you today?' } }]
      })
    });

    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });
  });

  it('should show error message when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/trouble connecting/i)).toBeInTheDocument();
    });
  });

  it('should show error when API returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/trouble connecting/i)).toBeInTheDocument();
    });
  });

  it('should show error when API returns invalid response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [] })
    });

    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/trouble connecting/i)).toBeInTheDocument();
    });
  });

  it('should not send message on Shift+Enter', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should not send empty message', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should send message via send button click', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Response' } }]
      })
    });

    render(<Chatbot />);
    
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(chatButton);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Test message' } });

    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => 
      btn.className.includes('rounded-full') && 
      !btn.className.includes('fixed')
    );
    
    if (sendButton) {
      fireEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });
});
