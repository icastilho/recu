#Tecnologias utilizadas

> * AngularJS
  * [Mocha](http://visionmedia.github.io/mocha/)
  * Sails
  
**Sempre que adicionar algum módulo node usar o *--save* para que o mesmo já seja adicionado no package.json**

### Requires
- ES5 (Array.indexOf, Array.forEach, Array.filter, Array.every, Function.bind, Date.now) A shim is provided for older browsers
- [Angular File Upload] (https://github.com/nervgh/angular-file-upload) Plugin
- [npm bignumber] (https://www.npmjs.org/package/bignumber.js) package

### How do I get set up? ###
* Database configuration
> **To connect using the shell:**
>> mongo dbh75.mongolab.com:27757/heroku_app19033587 -u recut -p recut
>
> **To connect using a driver via the standard URI (what's this?):**
>>  mongodb://recut:recut@dbh75.mongolab.com:27757/heroku_app19033587

## Rodando o Projeto sem Precisar ficar dando sails lift ###
* First of All
> sudo -H npm install -g forever

* Depois
> forever -w start app.js

* E para ver o Log
> forever logs p.js -f

##Assets
Os assets do layout.ejs são injetados automaticamente. Portanto caso queira fazer alguma alteração, adicione ou remova os assets e aponte no pipeline.js

# Deploy no Heroku

Instale o client do heroku

>* *Autenticar:* **heroku login**
* *Adicionar a referência ao remote do Heroku:* **git remote add heroku git@heroku.com:gfiscali.git**
* *Adicionar a chave, caso não tenha feito ainda:* **heroku keys:add ~/.ssh/id_rsa.pub**
* *Publicar:* **git push heroku master**

Add-ons

>* **Papertrail**: para verificar os logs
