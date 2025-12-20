import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Chatbot from './Chatbot';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_NVIDIA_API_KEY: 'test-api-key',
    },
  },
});

describe('Chatbot Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
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

  it('should send message on Enter key', async () => {
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
});
