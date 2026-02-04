const request = require('supertest');
const server = require('../../server');

describe('Auth API', () => {
    it('should login with default admin credentials', async () => {
        const res = await request(server)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin123!'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.usuario.username).toBe('admin');
    });

    it('should fail with wrong credentials', async () => {
        const res = await request(server)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('message');
    });
});
