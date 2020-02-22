# Welcome to Pokemon Tournament!

A repository made to track the development of Pokemon Tournament.

## Requirements

These requirements are essential to install and run Pokemon Tournament.

1.  [Git](https://git-scm.com/)
2.  [Yarn](https://yarnpkg.com/)
3.  [Docker](https://www.docker.com/)
4.  [Docker compose](https://github.com/docker/compose)


## Start the Pokemon Tournament

The repository is really fast and easy to setup. Follow the instructions:

### Clone the repository

To clone the repository and move your working directory inside it, run the commands:

```bash
git clone https://github.com/sreguzzoni/pokemon_tournament

cd pokemon_tournament
```

### Install packages

To install the packages required for compile the src assets, run the commands:

```bash
cd src

yarn install
```

This command will install all the Yarn packages reported by the dependencies. 
Once finished, run the command:

```bash
yarn encore dev
```

This command will encore all the JS/SCSS assets. If you want to run a watching process, you can run the command:

```bash
yarn encore dev --watch
```

### Docker

You're almost ready! This last step is pretty easy: from the root of this repository, run the follow commands:

```bash
cd docker

docker-compose up
```

The containers are running and you are now ready to partecipate at Pokemon Tournament! Just open your browser (_preferably Google Chrome_) and surf to
```
localhost
```


> **Attention:** The first time you run the docker-compose command, it will take a while because it will install all the components needed!