
/*
 * GET home page.
 */

exports.index = function(req, res){
//	console.dir (req.session.user);
	var validMenuItems = {
			left: [
						{
							name: 'Home',
							clas:'active',
							icon: 'home'
						},
						{
							name: 'EmployeeData',
							clas:'',
							icon:'list'
						}						
					],
			right:	[			      	 	
			      	 	{
			      	 		name: 'Welcome ' + req.session.user.fname + ', ' +
			      	 		req.session.user.title + req.session.user.lname + '!',
			      	 		icon: 'user'
			      	 	},
			      	 	{
							name: 'Logout',
							icon:'log-out'
			      	 	},
			        ]
	};
	res.render('index', { 
		title: 'Netxcell -- Employee Self Service',
		menuItems: validMenuItems,
		user: req.session.user
	});
};