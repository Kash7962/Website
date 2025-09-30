const { validationResult } = require('express-validator');
const Budget = require('../models/budget');
const ActivityLog = require('../models/activityLog')
const { Staff } = require('../models/staff')
const { Admin } = require('../models/admin')
/**
 * GET: Render budgets page
 */
exports.getBudgetPage = async (req, res) => {
  try {
    const budgets = await Budget.find().lean();
    res.render('Admin/budget', { budgets });
  } catch (err) {
    console.error('getBudgetPage error:', err);
    res.status(500).render('error/error',{ message: 'Server Error'});
  }
};

/**
 * POST: Create a new budget for a department
 */
exports.postBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('error/error',{ message: errors.array()[0].msg });
    }

    const { department, allocatedAmount } = req.body;

    const existingBudget = await Budget.findOne({ department: department.trim() });
    if (existingBudget) {
      return res.status(400).render('error/error',{ message:'Budget already exists for this department.'});
    }

    const newBudget = new Budget({
      department: department.trim(),
      allocatedAmount: Number(allocatedAmount),
      spentAmount: 0,
      purchases: []
    });

    await newBudget.save();

     const user = await Admin.findById(req.user._id);
                await ActivityLog.create({
                  userId : user._id,
                  userModel: 'Admin',
                  name: user.name,
                  email: user.email,
                  action: `New kitchen budget created`,
                  // targetModel: 'Admin',
                  // targetId: newAdmin._id,
                  // targetname: newAdmin.name,
                  // targetEmail: newAdmin.email ,
                  // registrationNumber: student.registration_number,
                  // classAssigned: student.classAssigned
                });
    res.redirect('/Budget/budget');
  } catch (err) {
    console.error('postBudget error:', err);
    res.status(500).render('error/error',{ message:'Server Error'});
  }
};

/**
 * POST: Update existing budget
 */
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, allocatedAmount } = req.body;

    const duplicate = await Budget.findOne({
      department: department.trim(),
      _id: { $ne: id }
    });
    if (duplicate) {
      return res.status(400).render('error/error',{ message:'Another budget already exists for this department.'});
    }

    await Budget.findByIdAndUpdate(
      id,
      {
        department: department.trim(),
        allocatedAmount: Number(allocatedAmount)
      },
      { new: true }
    );
     const user = await Admin.findById(req.user._id);
                await ActivityLog.create({
                  userId : user._id,
                  userModel: 'Admin',
                  name: user.name,
                  email: user.email,
                  action: `Kitchen budget updated`,
                  // targetModel: 'Admin',
                  // targetId: newAdmin._id,
                  // targetname: newAdmin.name,
                  // targetEmail: newAdmin.email ,
                  // registrationNumber: student.registration_number,
                  // classAssigned: student.classAssigned
                });
    res.redirect('/Budget/budget');
  } catch (err) {
    console.error('updateBudget error:', err);
    res.status(500).render('error/error',{ message:'Server Error'});
  }
};

/**
 * POST: Delete budget
 */
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    await Budget.findByIdAndDelete(id);
     const user = await Admin.findById(req.user._id);
                await ActivityLog.create({
                  userId : user._id,
                  userModel: 'Admin',
                  name: user.name,
                  email: user.email,
                  action: `Kitchen budget deleted`,
                  // targetModel: 'Admin',
                  // targetId: newAdmin._id,
                  // targetname: newAdmin.name,
                  // targetEmail: newAdmin.email ,
                  // registrationNumber: student.registration_number,
                  // classAssigned: student.classAssigned
                });
    res.redirect('/Budget/budget');
  } catch (err) {
    console.error('deleteBudget error:', err);
    res.status(500).render('error/error',{ message:'Server Error'});
  }
};

/**
 * Add a purchase record to the budget for a department
 * @param {String} department - Department name (e.g., "Kitchen")
 * @param {Object} purchaseData - { procurementId, inventoryId, items, totalPurchaseAmount, addedBy }
 */
exports.addPurchaseToBudget = async (department, purchaseData) => {
  try {
    const budget = await Budget.findOne({ department });
    if (!budget) {
      console.error(`Budget not found for department: ${department}`);
      return res.status(404).render('error/error',{ message:'Budget not found for department.'});
    }

    if (typeof budget.spentAmount !== 'number') budget.spentAmount = 0;
    if (!Array.isArray(budget.purchases)) budget.purchases = [];

    budget.spentAmount += Number(purchaseData.totalPurchaseAmount) || 0;
    budget.purchases.push({
      procurementId: purchaseData.procurementId,
      inventoryId: purchaseData.inventoryId,
      items: purchaseData.items || [],
      totalCost: Number(purchaseData.totalPurchaseAmount) || 0,
      addedBy: purchaseData.addedBy,
      date: new Date()
    });

    await budget.save();
    
    return { ok: true, budget };
  } catch (err) {
    console.error('addPurchaseToBudget error:', err);
    return res.status(500).render('error/error',{ message:'Server Error'});
  }
};
