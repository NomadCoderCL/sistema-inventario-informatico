const request = require('supertest');
const server = require('../../server');

describe('Estadisticas API', () => {
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

    it('should return global stats with correct properties', async () => {
        const res = await request(server)
            .get('/api/estadisticas')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('totalEquipos');
        expect(res.body.data).toHaveProperty('equiposNuevos');
        expect(res.body.data).toHaveProperty('equiposUsados');
        expect(res.body.data).toHaveProperty('equiposBuenEstado');
        expect(res.body.data).toHaveProperty('equiposMalasCondiciones');
        expect(res.body.data).toHaveProperty('equiposPorTipo');
        expect(res.body.data).toHaveProperty('equiposPorUbicacion');
        expect(res.body.data).toHaveProperty('totalSalidas');
    });

    it('should return non-empty statistics based on seed data', async () => {
        const res = await request(server)
            .get('/api/estadisticas')
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.data.totalEquipos).toBeGreaterThan(0);
        expect(Array.isArray(res.body.data.equiposPorTipo)).toBe(true);
        expect(Array.isArray(res.body.data.equiposPorUbicacion)).toBe(true);
    });
});
