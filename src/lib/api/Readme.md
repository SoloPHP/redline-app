// GET запросы
const posts = await client.get('/posts');
const user = await client.get('/users/123');
const data = await client.get('/posts', { page: 2, limit: 5 });

// POST запросы  
const newPost = await client.post('/posts', { title: 'Заголовок', content: 'Текст' });
const loginResult = await client.post('/auth/login', { email, password });

// PUT/PATCH запросы
const updated = await client.put('/posts/123', { title: 'Новый заголовок' });
const patched = await client.patch('/users/profile', { name: 'Новое имя' });

// DELETE запросы
await client.delete('/posts/123');

// Загрузка файлов
const formData = new FormData();
formData.append('file', file);
const result = await client.upload('/upload', formData);