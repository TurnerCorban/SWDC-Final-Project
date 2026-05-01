<h1>Software Design & Construction Final Project</h1>
<h4>Corban Turner & Johnathan Church</h4>

<h2>Requirements</h2>

> - Docker/Podman
> - Docker Compose compatibility 

<h2>Usage</h2>
To run the project, use

```bash
podman compose up -d
```


default ports
- Frontent-User: 5173
- Frontend-Admin: 5174
- Backend: 8080

<h2>Notes</h2>

A default Admin account is created when the program is composed

The username/password is configurable within [docker-compose.yml](docker-compose.yml)
