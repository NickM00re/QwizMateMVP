import {AsyncStorageRepository} from '../src/services/storage/AsyncStorageRepository';

interface Widget {
  id: string;
  name: string;
}

describe('AsyncStorageRepository', () => {
  it('saves a new entity and retrieves it by id', async () => {
    const repo = new AsyncStorageRepository<Widget>('test/widgets');
    await repo.save({id: '1', name: 'First'});

    const found = await repo.getById('1');
    expect(found).toEqual({id: '1', name: 'First'});
  });

  it('updates an existing entity in place instead of duplicating it', async () => {
    const repo = new AsyncStorageRepository<Widget>('test/widgets-update');
    await repo.save({id: '1', name: 'First'});
    await repo.save({id: '1', name: 'Updated'});

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Updated');
  });

  it('removes an entity by id', async () => {
    const repo = new AsyncStorageRepository<Widget>('test/widgets-remove');
    await repo.save({id: '1', name: 'First'});
    await repo.save({id: '2', name: 'Second'});
    await repo.remove('1');

    const all = await repo.getAll();
    expect(all.map(w => w.id)).toEqual(['2']);
  });

  it('returns an empty array when nothing has been stored yet', async () => {
    const repo = new AsyncStorageRepository<Widget>('test/widgets-empty');
    expect(await repo.getAll()).toEqual([]);
  });
});
