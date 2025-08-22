const StaffFace = require('../models/staffFace'); // create this model
// You can import Staff too if needed later

// Save face encoding
const saveFace = async (req, res) => {
  try {
    const { name, encoding, email, staffId } = req.body;

    if (
      !name ||
      !email ||
      !staffId ||
      !Array.isArray(encoding) ||
      encoding.length !== 128 ||
      !encoding.every(n => typeof n === "number")
    ) {
      return res.status(400).json({ success: false, error: "Invalid face encoding format" });
    }

    // Check if a record with the same name & email already exists
    const existingFace = await StaffFace.findOne({ name, email, staffId });
    if (existingFace) {
      return res.status(400).json({
        success: false,
        error: `Face data already exists for this staff (name and email)`,
      });
    }

    await StaffFace.create({ name, email, encoding, staffId });

    return res.json({ success: true, message: "Face data saved successfully" });
  } catch (err) {
    console.error("Error saving face:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Match face encoding
const matchFace = async (req, res) => {
  try {
    const { encoding } = req.body;

    if (!Array.isArray(encoding) || encoding.length !== 128) {
      return res.status(400).json({ matched: false, error: "Invalid encoding" });
    }

    const allStaff = await StaffFace.find();
    if (!allStaff.length) return res.json({ matched: false });

    const euclideanDistance = (a, b) =>
      Math.sqrt(a.reduce((acc, val, i) => acc + Math.pow(val - b[i], 2), 0));

    let bestMatch = null;
    let minDistance = 1.0;

    for (const staff of allStaff) {
      const dist = euclideanDistance(encoding, staff.encoding);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = staff;
      }
    }
    // console.log(bestMatch, minDistance)
    if (minDistance < 0.45 && bestMatch) {
      return res.json({
        matched: true,
        _id: bestMatch.staffId,
        name: bestMatch.name,
        email: bestMatch.email,
        distance: minDistance
      });
    } else {
      return res.json({ matched: false });
    }
  } catch (err) {
    console.error("Error matching face:", err);
    return res.status(500).json({ matched: false, error: "Server error" });
  }
};

const renderFaceRegister = (req, res) => {
  const { name, email, staffId } = req.query;
    // console.log(name, email, staffId)
  if (!name || !email || !staffId) {
    
    return res.status(400).render('error/error', { message: "Missing name or email" });
  }

  // Pass name & email to EJS
  res.render('Staff/registerFace', { name, email, staffId });
};

const renderAttendancePage = (req, res) => {
  try {
    res.render("Staff/takeStaffAttendance", {
      title: "Staff Face Attendance"
    });
  } catch (err) {
    console.error("Error rendering face attendance page:", err);
    res.status(500).render("error/error", {
      message: "Unable to load Face Attendance page"
    });
  }
};

module.exports = { saveFace, matchFace, renderFaceRegister, renderAttendancePage, };
