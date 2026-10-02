import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyBookings from './MyBookings';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy, limit, startAfter, deleteDoc, doc } from 'firebase/firestore';

// Mock Firebase services
jest.mock('./firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('./LoadingSpinner', () => () => <div data-testid="loading-spinner">Loading...</div>);

const mockUser = { uid: 'test-user-id' };
const PAGE_SIZE = 5;

const mockBookings = [
  { id: '1', service: 'Service A', date: '2026-03-10', address: 'Address A', status: 'Pending' },
  { id: '2', service: 'Service B', date: '2026-03-11', address: 'Address B', status: 'Completed' },
  { id: '3', service: 'Service C', date: '2026-03-12', address: 'Address C', status: 'Pending' },
  { id: '4', service: 'Service D', date: '2026-03-13', address: 'Address D', status: 'Completed' },
  { id: '5', service: 'Service E', date: '2026-03-14', address: 'Address E', status: 'Pending' },
  { id: '6', service: 'Service F', date: '2026-03-15', address: 'Address F', status: 'Completed' },
];

describe('MyBookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });
    query.mockImplementation((...args) => args);
    collection.mockReturnValue({});
    doc.mockImplementation((db, collectionName, docId) => ({
        id: docId,
        path: `${collectionName}/${docId}`,
    }));
  });

  it('renders loading spinner initially', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    render(<MyBookings />);
    await waitFor(() => expect(screen.getByTestId('loading-spinner')).toBeInTheDocument());
  });

  it('fetches and displays bookings', async () => {
    getDocs.mockResolvedValueOnce({
      docs: mockBookings.slice(0, 2).map(b => ({ id: b.id, data: () => b })),
    });
    render(<MyBookings />);

    await waitFor(async () => {
        expect(await screen.findByText('Service A')).toBeInTheDocument();
        expect(screen.getByText('Service B')).toBeInTheDocument();
    });
  });

  it('displays a message when there are no bookings', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    render(<MyBookings />);

    await waitFor(() => {
        expect(screen.getByText("You haven't made any bookings yet.")).toBeInTheDocument();
    });
  });

  it('filters bookings by status', async () => {
    getDocs.mockResolvedValueOnce({
        docs: mockBookings.filter(b => b.status === 'Pending').slice(0, PAGE_SIZE).map(b => ({ id: b.id, data: () => b })),
    });
    getDocs.mockResolvedValueOnce({
        docs: mockBookings.filter(b => b.status === 'Completed').slice(0, PAGE_SIZE).map(b => ({ id: b.id, data: () => b })),
    });

    render(<MyBookings />);

    await waitFor(async () => {
        await screen.findByText('Service A');
    });


    fireEvent.change(screen.getByLabelText('Status:'), { target: { value: 'Completed' } });

    await waitFor(() => {
        expect(where).toHaveBeenCalledWith('status', '==', 'Completed');
    });
    
    await waitFor(async () => {
        expect(await screen.findByText('Service B')).toBeInTheDocument();
        expect(screen.queryByText('Service A')).not.toBeInTheDocument();
    });
  });

  it('loads more bookings', async () => {
    const initialBookings = mockBookings.slice(0, PAGE_SIZE);
    const moreBookings = mockBookings.slice(PAGE_SIZE);
    getDocs
      .mockResolvedValueOnce({
        docs: initialBookings.map(b => ({ id: b.id, data: () => b })),
      })
      .mockResolvedValueOnce({
        docs: moreBookings.map(b => ({ id: b.id, data: () => b })),
      });
    
    render(<MyBookings />);
    
    await waitFor(async () => {
        expect(await screen.findByText('Service A')).toBeInTheDocument();
    });


    const loadMoreButton = await screen.findByText('Load More');
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
        expect(startAfter).toHaveBeenCalled();
    });
    
    await waitFor(async () => {
        expect(await screen.findByText('Service F')).toBeInTheDocument();
    });
  });

  it('cancels a booking', async () => {
    getDocs.mockResolvedValueOnce({
        docs: mockBookings.slice(0,1).map(b => ({ id: b.id, data: () => b })),
    });
    deleteDoc.mockResolvedValueOnce(undefined);

    render(<MyBookings />);

    const cancelButton = await screen.findByText('Cancel Booking');
    fireEvent.click(cancelButton);

    expect(screen.getByText('Are you sure you want to cancel this booking?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Cancel'));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledWith(expect.objectContaining({
          id: '1'
      }));
    });
    await waitFor(async () => {
        expect(await screen.findByText('Booking cancelled successfully.')).toBeInTheDocument();
    });
  });
});

