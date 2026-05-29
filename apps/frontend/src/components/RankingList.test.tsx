import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import RankingList, { type RankingEntry } from './RankingList.js';

const make = (entries: RankingEntry[]) => render(<RankingList entries={entries} />);

describe('RankingList', () => {
  it('renders entries sorted by score descending', () => {
    make([
      { id: '1', name: 'alice', score: 3 },
      { id: '2', name: 'bob', score: 7 },
      { id: '3', name: 'carla', score: 5 },
    ]);
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('bob')).toBeDefined();
    expect(within(items[1]).getByText('carla')).toBeDefined();
    expect(within(items[2]).getByText('alice')).toBeDefined();
  });

  it('renders fixed position numbers 1..n in order', () => {
    make([
      { id: '1', name: 'alice', score: 3 },
      { id: '2', name: 'bob', score: 7 },
    ]);
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('1')).toBeDefined();
    expect(within(items[1]).getByText('2')).toBeDefined();
  });

  it('highlights the top scorer with accent background', () => {
    make([
      { id: '1', name: 'alice', score: 3 },
      { id: '2', name: 'bob', score: 7 },
    ]);
    const items = screen.getAllByRole('listitem');
    expect(items[0].className).toContain('bg-accent');
    expect(items[1].className).not.toContain('bg-accent');
  });

  it('highlights nobody when the top score is tied', () => {
    make([
      { id: '1', name: 'alice', score: 5 },
      { id: '2', name: 'bob', score: 5 },
      { id: '3', name: 'carla', score: 2 },
    ]);
    const items = screen.getAllByRole('listitem');
    expect(items[0].className).not.toContain('bg-accent');
    expect(items[1].className).not.toContain('bg-accent');
    expect(items[2].className).not.toContain('bg-accent');
  });

  it('highlights nobody when every score is zero', () => {
    make([
      { id: '1', name: 'alice', score: 0 },
      { id: '2', name: 'bob', score: 0 },
    ]);
    const items = screen.getAllByRole('listitem');
    expect(items[0].className).not.toContain('bg-accent');
    expect(items[1].className).not.toContain('bg-accent');
  });

  it('shows (host) suffix when isHost is true', () => {
    make([{ id: '1', name: 'alice', score: 3, isHost: true }]);
    expect(screen.getByText('(host)')).toBeDefined();
  });
});
