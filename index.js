const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminRoute = require('./routes/admin')
const Admin = require('./models/userAdmin')
const authConfig = require('./config/auth.json')
const Produtos = require('./models/Produto')

mongoose.Promise = global.Promise
mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb://localhost/catalogo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('db connected!')
}).catch(err => console.error(err))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors())

app.get('/', async (req, res) => {
    const findIt = req.body.tipo
    const exactsProducts = await Produtos.find({ tipo: req.body.tipo }).sort({})
    const products = await Produtos.find().sort({})

    findIt ? res.send(exactsProducts) : res.send(products)

})

app.get('/tipos', async (req, res) => {
    const itens = await Produtos.distinct('tipo')
    res.send(itens)
})

app.post('/auth', async (req, res) => {
    const { user, password } = req.body
    
    const adminUser = await Admin.findOne({ user }).select('+password')

    if (! await bcrypt.compare(password, adminUser.password))
        return res.redirect('http://localhost:3000')

    adminUser.password = undefined

    const token = jwt.sign({ id: adminUser._id }, authConfig.secret, {
        expiresIn: 86400,
    })
    res.send(token).redirect('http://localhost:3000/admin/catalogo')
})

app.use('/admin', adminRoute)

app.listen(8081, () => {
    console.log('Listen on port 8081!')
})