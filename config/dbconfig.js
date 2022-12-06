var mongoose = require('mongoose');



mongoose.connect('mongodb+srv://adminexpress:8sX5ruyGiscOTpya@expressjs.ruclfye.mongodb.net/NewsPortal?retryWrites=true&w=majority');

var mongoosedb = module.exports = mongoose;