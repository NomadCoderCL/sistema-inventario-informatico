const request = require('supertest');
const server = require('../../server');

describe('Marcas API', () => {
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

    it('should list all brands', async () => {
        const res = await request(server)
            .get('/api/marcas/todas')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should create a new brand', async () => {
        const newMarca = {
            nombre: 'Marca de Prueba',
            descripcion: 'Descripcion de prueba'
        };

        const res = await request(server)
            .post('/api/marcas')
            .set('Authorization', `Bearer ${token}`)
            .send(newMarca);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
    });

    it('should update a brand status (obsolete)', async () => {
        const res = await request(server)
            .put('/api/marcas/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Dell Actualizado',
                obsoleto: 1
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});
