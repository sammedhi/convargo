'use strict';

//list of truckers
//useful for ALL 5 steps
//could be an array of objects that you fetched from api or database
const truckers = [{
  'id': 'f944a3ff-591b-4d5b-9b67-c7e08cba9791',
  'name': 'les-routiers-bretons',
  'pricePerKm': 0.05,
  'pricePerVolume': 5
}, {
  'id': '165d65ec-5e3f-488e-b371-d56ee100aa58',
  'name': 'geodis',
  'pricePerKm': 0.1,
  'pricePerVolume': 8.5
}, {
  'id': '6e06c9c0-4ab0-4d66-8325-c5fa60187cf8',
  'name': 'xpo',
  'pricePerKm': 0.10,
  'pricePerVolume': 10
}];

//list of current shippings
//useful for ALL steps
//The `price` is updated from step 1 and 2
//The `commission` is updated from step 3
//The `options` is useful from step 4
const deliveries = [{
  'id': 'bba9500c-fd9e-453f-abf1-4cd8f52af377',
  'shipper': 'bio-gourmet',
  'truckerId': 'f944a3ff-591b-4d5b-9b67-c7e08cba9791',
  'distance': 100,
  'volume': 4,
  'options': {
    'deductibleReduction': false
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'convargo': 0
  }
}, {
  'id': '65203b0a-a864-4dea-81e2-e389515752a8',
  'shipper': 'librairie-lu-cie',
  'truckerId': '165d65ec-5e3f-488e-b371-d56ee100aa58',
  'distance': 650,
  'volume': 12,
  'options': {
    'deductibleReduction': true
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'convargo': 0
  }
}, {
  'id': '94dab739-bd93-44c0-9be1-52dd07baa9f6',
  'shipper': 'otacos',
  'truckerId': '6e06c9c0-4ab0-4d66-8325-c5fa60187cf8',
  'distance': 1250,
  'volume': 30,
  'options': {
    'deductibleReduction': true
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'convargo': 0
  }
}];

//list of actors for payment
//useful from step 5
const actors = [{
  'deliveryId': 'bba9500c-fd9e-453f-abf1-4cd8f52af377',
  'payment': [{
    'who': 'shipper',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'trucker',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'convargo',
    'type': 'credit',
    'amount': 0
  }]
}, {
  'deliveryId': '65203b0a-a864-4dea-81e2-e389515752a8',
  'payment': [{
    'who': 'shipper',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'trucker',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'convargo',
    'type': 'credit',
    'amount': 0
  }]
}, {
  'deliveryId': '94dab739-bd93-44c0-9be1-52dd07baa9f6',
  'payment': [{
    'who': 'shipper',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'trucker',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'convargo',
    'type': 'credit',
    'amount': 0
  }]
}];

const priceRateByM3 = 
		[[0.5,25],
		 [0.7,10],
		 [0.9,5]];

console.log(truckers);
console.log(deliveries);
console.log(actors);

console.log(computeAll());

function computeAll()
{
	var payments = [];
	for(var i = 0;i < deliveries.length;i++)
	{
		var delivery = deliveries[i];
		var shipping_price = adaptPriceToM3(getShippingPrice(delivery) , delivery["volume"]);
		delivery["price"] = shipping_price;
		
		var deductible_reduction = getDeductibleReduction(delivery);
		var commission = computeCommission(delivery)
		
		var payment = {
		"deliveryId": delivery["id"],
		"payment": [
			  {
				"who": "shipper",
				"type": "debit",
				"amount": shipping_price + deductible_reduction
			  },
			  {
				"who": "owner",
				"type": "credit",
				"amount": shipping_price - commission["total"]
			  },
			  {
				"who": "insurance",
				"type": "credit",
				"amount": commission["insurance"]
			  },
			  {
				"who": "treasury",
				"type": "credit",
				"amount": commission["treasury"]
			  },
			  {
				"who": "convargo",
				"type": "credit",
				"amount": commission["convargo"] + deductible_reduction
			  }
			]
		}
		payments.push(payment);
	}
	return payments
}

function getShippingPrice(delivery)
{
	var shipping_prices = 0;
	var trucker = findTruckerByID(delivery.truckerId)
	return delivery["distance"] * trucker["pricePerKm"] + delivery["volume"] * trucker["pricePerVolume"];
}

function findTruckerByID(id)
{
	for(var i = 0;i < truckers.length;i++)
	{
		if (truckers[i]["id"] == id)
			return truckers[i]
	}
}
		 
function adaptPriceToM3(price,m3)
{
	for(var i = 0;i < priceRateByM3.length;i++)
	{
		if(priceRateByM3[i][1] < m3)
			return priceRateByM3[i][0] * price;
	}
	return price;
}

function computeCommission(delivery)
{
	var price = delivery["price"];
	var distanceInKm = delivery["distance"];
	
	var commission = {
		"total" : 0,
		"insurance": 0,
		"treasury": 0,
		"convargo": 0};
	
	var total_commission = 0.3 * price;
	commission["total"] = total_commission;
	commission["insurance"] = 0.5 * total_commission;
	commission["treasury"] = (Math.trunc(distanceInKm / 500.0) + 1) * 1;
	commission["convargo"] = Math.max(0,total_commission - commission["insurance"] - commission["treasury"]);
	
	return commission
}

function getDeductibleReduction(delivery)
{
	if(!delivery["options"]["deductibleReduction"])
		return 0.0;
	return 1.0 * delivery["volume"];
}
