const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const ListOrder = require('../models/listOrderModel');
const Order = require('../models/OrderModel');
const { userUseVoucher } = require('./VoucherController');
const SalespersonModel = require('../models/SalespersonModel');

exports.getUserOrder = asyncErrorHandler(async (req, res, next) => {
  const listOrder = await Order.find({
    account_id: req.user.id,
    status: req.params.status,
  })
    .populate({
      model: 'ListOrder',
      path: 'list_order_id',
      populate: { model: 'Product', path: 'product' },
    })
    .populate({
      model: 'Salesperson',
      path: 'salesperson_id',
    })
    .populate({
      model: 'Voucher',
      path: 'voucher_id',
    });
  res.status(200).json({
    success: true,
    listOrder,
  });
});

exports.getOrderByID = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate({
      model: 'ListOrder',
      path: 'list_order_id',
      populate: { model: 'Product', path: 'product' },
    })
    .populate({
      model: 'Salesperson',
      path: 'salesperson_id',
    })
    .populate({
      model: 'Voucher',
      path: 'voucher_id',
    });
  res.status(200).json({
    success: true,
    order,
  });
});

exports.getAllOrderStatus = asyncErrorHandler(async (req, res, next) => {
  const now = new Date();
  const date = now.getDate() >= 10 ? now.getDate() : '0' + now.getDate();
  let mo = now.getMonth() + 1;
  const month = mo >= 10 ? mo : '0' + mo;
  const cur = '' + date + '-' + month + '-' + now.getFullYear();
  const Orders = await Order.find({
    status: req.params.status,
    date_refill: cur,
  })
    .populate({
      model: 'ListOrder',
      path: 'list_order_id',
      populate: { model: 'Product', path: 'product' },
    })
    .populate({
      model: 'Salesperson',
      path: 'salesperson_id',
    });
  res.status(200).json({
    success: true,
    Orders,
  });
});

exports.getSalespersonOrder = asyncErrorHandler(async (req, res, next) => {
  const listOrder = await Order.find({
    salesperson_id: req.user.id,
  });
  res.status(200).json({
    success: true,
    listOrder,
  });
});

const getOrderStatus = async (status) => {
  const now = new Date();
  const date = now.getDate() >= 10 ? now.getDate() : '0' + now.getDate();
  let mo = now.getMonth() + 1;
  const month = mo >= 10 ? mo : '0' + mo;
  const cur = '' + date + '-' + month + '-' + now.getFullYear();
  const Orders = await Order.find({
    status: status,
    date_refill: cur,
  })
    .populate({
      model: 'ListOrder',
      path: 'list_order_id',
      populate: { model: 'Product', path: 'product' },
    })
    .populate({
      model: 'Salesperson',
      path: 'salesperson_id',
    });
  return Orders;
};

exports.getSalerOrder = asyncErrorHandler(async (req, res, next) => {
  const saler = await SalespersonModel.findOne({
    account_id: req.user.id,
  });
  const listOrder = await Order.find({
    salesperson_id: saler.id,
  })
    .populate({
      model: 'ListOrder',
      path: 'list_order_id',
      populate: { model: 'Product', path: 'product' },
    })
    .populate({
      model: 'Salesperson',
      path: 'salesperson_id',
    })
    .populate({
      model: 'Voucher',
      path: 'voucher_id',
    })
    .populate({
      model: 'User',
      path: 'account_id',
    });
  res.status(200).json({
    success: true,
    listOrder,
  });
});

exports.getShipperOrder = asyncErrorHandler(async (req, res, next) => {
  const listOrder = await Order.find({
    shipper_id: req.user.id,
    status: req.query.status,
  })
    .populate({
      model: 'ListOrder',
      path: 'list_order_id',
      populate: { model: 'Product', path: 'product' },
    })
    .populate({
      model: 'Salesperson',
      path: 'salesperson_id',
    });
  res.status(200).json({
    success: true,
    listOrder,
  });
});

exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
  const find = Order.findOne({
    id: req.params.id,
  });
  if (!find) {
    return next(new ErrorHandler('Order Not Found', 404));
  }
  if (find.shipper_id && req.body.shipper_id) {
    return next(new ErrorHandler('Orders are being delivered', 401));
  }

  let update = {
    status: req.body.status,
  };
  if (req.body.shipper_id) {
    update = {
      status: req.body.status,
      shipper_id: req.body.shipper_id,
    };
  }

  const order = await Order.findByIdAndUpdate(req.params.id, update);
  if (req.body.status == 'Đang giao hàng' || req.body.status == 'Đã xác nhận') {
    const Orders = await getOrderStatus('Đã xác nhận');
    await req.io.emit(`orderShip`, {
      orders: Orders,
      message: req.body.status == 'Đã xác nhận' ? 'Có đơn hàng mới' : null,
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.createOrder = asyncErrorHandler(async (req, res, next) => {
  if (req.body.voucher_id) {
    await userUseVoucher(req.user.id, req.body.voucher_id);
  }
  const list = await createListOrder(req.body.list_order);
  req.body.list_order_id = list;
  const order = await Order.create(req.body);
  res.status(200).json({
    success: true,
    order,
  });
});

const createListOrder = async (listOrder) => {
  const list = await ListOrder.create(
    listOrder.map((e) => {
      return e;
    })
  );
  return list.map((e) => e.id);
};
