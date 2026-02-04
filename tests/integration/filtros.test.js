const request = require('supertest');
const server = require('../../server');

describe('Filtros API', () => {
    let token;

    beforeAll(async () => {
        const loginRes = await request(server)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin123!'
            });
        token = loginRes.body.data.token;
    });

    it('should filter equipment by brand', async () => {
        const res = await request(server)
            .get('/api/equipos/filtros?marca_id=1')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        // Verificar que todos los resultados sean de la marca 1
        res.body.data.forEach(e => {
            expect(e.marca_id).toBe(1);
        });
    });

    it('should filter equipment by status', async () => {
        const res = await request(server)
            .get('/api/equipos/filtros?estado=buen estado')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        res.body.data.forEach(e => {
            expect(e.estado).toBe('buen estado');
        });
    });

    it('should return empty array for non-matching filters', async () => {
        const res = await request(server)
            .get('/api/equipos/filtros?marca_id=999')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(0);
    });
});
