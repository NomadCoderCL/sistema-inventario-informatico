const request = require('supertest');
const server = require('../../server');

describe('Equipos API', () => {
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

    it('should list all equipment', async () => {
        const res = await request(server)
            .get('/api/equipos')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should create a new equipment', async () => {
        const newEquipo = {
            codigo: 'TEST-001',
            nombre: 'Equipo de Prueba',
            marca_id: 1,
            modelo: 'Modelo Pro',
            serie: 'SN-TEST-001',
            tipo_dispositivo: 'PC',
            categoria_id: 1,
            ubicacion_id: 1,
            uso: 'nuevo',
            estado: 'buen estado'
        };

        const res = await request(server)
            .post('/api/equipos')
            .set('Authorization', `Bearer ${token}`)
            .send(newEquipo);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
    });

    it('should fail to create equipment with duplicate code', async () => {
        const newEquipo = {
            codigo: 'PC001', // Ya existe en el seed
            nombre: 'Duplicado',
            marca_id: 1,
            tipo_dispositivo: 'PC',
            categoria_id: 1,
            ubicacion_id: 1
        };

        const res = await request(server)
            .post('/api/equipos')
            .set('Authorization', `Bearer ${token}`)
            .send(newEquipo);

        // El servidor devuelve 500 por error de SQLite de duplicado si no se maneja específicamente
        // Pero en equiposService.create tenemos un manejo de errores
        expect(res.statusCode).toEqual(500);
        expect(res.body.success).toBe(false);
    });
});
