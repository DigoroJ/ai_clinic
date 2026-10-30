const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const queries = require('../queries/queries');
const fs = require('fs');
const path = require('path');


// ======================================================
// DATABASE CONNECTION (shared pool)
// ======================================================

const pool = require('../db/pool');


// ======================================================
// AUTHENTICATION
// ======================================================

const addUser = async (req, res) => {

    try {

        const {
            first_name,
            last_name,
            email,
            password,
            role,
            phone
        } = req.body;

        if (!first_name || !last_name || !email || !password) {

            return res.status(400).json({
                success: false,
                error: 'First name, last name, email and password are required'
            });

        }

        const existingUser = await pool.query(
            queries.getUserByEmail,
            [email]
        );

        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                error: 'Email already exists'
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            queries.addUser,
            [
                first_name,
                last_name,
                email,
                hashedPassword,
                role || 'patient',
                phone || null
            ]
        );

        const user = result.rows[0];

        delete user.password;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user
        });

    } catch (error) {

        console.error('Add user error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to create user'
        });

    }

};


const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });

        }

        const result = await pool.query(
            queries.getUserByEmail,
            [email]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });

        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {

            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });

        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {

        console.error('Login error:', error);

        res.status(500).json({
            success: false,
            error: 'Login failed'
        });

    }

};

const getCurrentUser = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getUserById,
            [req.user.id]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                error: 'User account no longer exists'
            });

        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {

        console.error('Get current user error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve current user'
        });

    }

};

const getNurses = async (req, res) => {
  try {
    const result = await pool.query(queries.getNurses);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching nurses:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch nurses'
    });
  }
};


// ======================================================
// PATIENTS
// ======================================================

const getPatients = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getPatients
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get patients error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve patients'
        });

    }

};


const getPatientById = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getUserById,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Get patient error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve patient'
        });

    }

};


// ======================================================
// SERVICES
// ======================================================

const getServices = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getServices
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get services error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve services'
        });

    }

};


// ======================================================
// DOCTORS
// ======================================================

const getDoctors = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getDoctors
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get doctors error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve doctors'
        });

    }

};


const getDoctorById = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getDoctorById,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Get doctor error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve doctor'
        });

    }

};


const getDoctorsByService = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getDoctorsByService,
            [req.params.serviceId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get doctors by service error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve doctors for service'
        });

    }

};


// ======================================================
// APPOINTMENTS
// ======================================================

const bookAppointment = async (req, res) => {

    try {

        const {
            patient_id,
            doctor_id,
            service_id,
            appointment_date,
            appointment_time
        } = req.body;

        if (
            !patient_id ||
            !doctor_id ||
            !service_id ||
            !appointment_date ||
            !appointment_time
        ) {

            return res.status(400).json({
                success: false,
                error: 'All appointment fields are required'
            });

        }

        const result = await pool.query(
            queries.createAppointment,
            [
                patient_id,
                doctor_id,
                service_id,
                appointment_date,
                appointment_time
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointment: result.rows[0]
        });

    } catch (error) {

        console.error('Book appointment error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to book appointment'
        });

    }

};


const getAppointments = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getAppointments
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get appointments error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve appointments'
        });

    }

};


const getAppointmentsByPatient = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getAppointmentsByPatient,
            [req.params.patientId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get patient appointments error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve patient appointments'
        });

    }

};


const getAppointmentById = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getAppointmentById,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Get appointment error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve appointment'
        });

    }

};


const cancelAppointment = async (req, res) => {

    try {

        const result = await pool.query(
            queries.cancelAppointment,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });

        }

        res.json({
            success: true,
            message: 'Appointment cancelled',
            appointment: result.rows[0]
        });

    } catch (error) {

        console.error('Cancel appointment error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to cancel appointment'
        });

    }

};


// ======================================================
// MEDICAL RECORDS
// ======================================================

const getMedicalRecords = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getMedicalRecords,
            [req.params.patientId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get medical records error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve medical records'
        });

    }

};


const getMedicalRecordById = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getMedicalRecordById,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Medical record not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Get medical record error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve medical record'
        });

    }

};


// ======================================================
// PRESCRIPTIONS
// ======================================================

const getPrescriptions = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getPrescriptions,
            [req.params.patientId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get prescriptions error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve prescriptions'
        });

    }

};


// ======================================================
// MESSAGES
// ======================================================

const getMessages = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getMessages,
            [req.params.patientId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get messages error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve messages'
        });

    }

};


const sendMessage = async (req, res) => {

    try {

        const {
            sender_id,
            recipient_id,
            subject,
            message
        } = req.body;

        if (!sender_id || !recipient_id || !message) {

            return res.status(400).json({
                success: false,
                error: 'Sender, recipient and message are required'
            });

        }

        const result = await pool.query(
            queries.createMessage,
            [
                sender_id,
                recipient_id,
                subject || null,
                message
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Send message error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to send message'
        });

    }

};


const markMessageRead = async (req, res) => {

    try {

        const result = await pool.query(
            queries.markMessageRead,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Mark message read error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to update message'
        });

    }

};


// ======================================================
// HEALTH TIPS
// ======================================================

const getHealthTips = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getHealthTips
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get health tips error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve health tips'
        });

    }

};


// ======================================================
// SYMPTOMS
// ======================================================

const getSymptoms = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getSymptoms
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get symptoms error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve symptoms'
        });

    }

};


// ======================================================
// DASHBOARD
// ======================================================

const getDashboardStats = async (req, res) => {

    try {

        const patients = await pool.query(
            queries.totalPatients
        );

        const doctors = await pool.query(
            queries.totalDoctors
        );

        const appointments = await pool.query(
            queries.totalAppointments
        );

        const upcoming = await pool.query(
            queries.upcomingAppointments
        );

        res.json({
            success: true,
            patients: Number(patients.rows[0].total),
            doctors: Number(doctors.rows[0].total),
            appointments: Number(appointments.rows[0].total),
            upcomingAppointments: Number(upcoming.rows[0].total)
        });

    } catch (error) {

        console.error('Dashboard stats error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve dashboard statistics'
        });

    }

};


const getCurrentDatasetEda = async (req, res) => {
  try {
    // Call the Python Flask EDA service
    const response = await fetch(
      'http://127.0.0.1:5001/dataset/eda/current',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    // Read the Python response
    const result = await response.json();

    // Handle errors returned by Python
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message:
          result.error || 'Failed to analyse the current dataset.'
      });
    }

    // Return EDA results to the Angular frontend
    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(
      'Error retrieving current dataset EDA:',
      error
    );

    // Handle Python service connection errors and timeouts
    return res.status(503).json({
      success: false,
      message: 'The Python EDA service is unavailable.',
      error: error.message
    });
  }
};

const getAiAnalytics = async (req, res) => {
  try {
    const modelsDir = path.resolve(
      __dirname,
      '../../ML/models'
    );

    const metadataPath = path.join(
      modelsDir,
      'model_metadata.json'
    );

    const comparisonPath = path.join(
      modelsDir,
      'model_comparison.csv'
    );

    
    const [metadataContent, comparisonContent] =
    await Promise.all([
        fs.promises.readFile(metadataPath, 'utf8'),
        fs.promises.readFile(comparisonPath, 'utf8')
    ]);


    const metadata = JSON.parse(metadataContent);

    const lines = comparisonContent
      .trim()
      .split(/\r?\n/);

    if (lines.length < 2) {
      return res.status(404).json({
        success: false,
        message: 'No model comparison results are available.'
      });
    }

    const headers = lines[0].split(',').map(
      header => header.trim()
    );

    const models = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index]?.trim();
      });

      return {
        name: row.model,
        accuracy: Number(row.accuracy) * 100,
        precision: Number(row.precision_macro) * 100,
        recall: Number(row.recall_macro) * 100,
        f1Score: Number(row.f1_macro) * 100
      };
    });

    const bestModel = models.find(
      model => model.name === metadata.model_name
    );

    return res.status(200).json({
      success: true,
      data: {
        bestModel: metadata.model_name,
        bestAccuracy: bestModel?.accuracy ?? null,
        trainingRecords: null,
        predictions: null,
        models
      }
    });

  } catch (error) {
    console.error('Error loading AI analytics:', error);

    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message:
          'Model results are missing. Run train_model.py first.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve AI analytics.'
    });
  }

};


const predictDisease = async (req, res) => {
  try {
    const {
      patient_id,
      fever,
      cough,
      rash,
      headache,
      vomiting,
      fatigue,
      sore_throat,
      breathing_issue,
      age,
      gender,
      temperature,
      days_symptoms,
      travel_history
    } = req.body;

    const patientId = Number(patient_id);

    if (!Number.isSafeInteger(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid patient_id is required.'
      });
    }

    // Step 1: Get the prediction from Python.
    const response = await fetch(
      'http://127.0.0.1:5001/predict',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          fever,
          cough,
          rash,
          headache,
          vomiting,
          fatigue,
          sore_throat,
          breathing_issue,
          age,
          gender,
          temperature,
          days_symptoms,
          travel_history
        }),
        signal: AbortSignal.timeout(15000)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.error || 'Prediction failed.',
        missingFeatures: result.missingFeatures
      });
    }

    // Step 2: Calculate confidence from the probabilities.
    let confidence = null;

    if (result.probabilities) {
      const values = Array.isArray(result.probabilities)
        ? result.probabilities.map(item =>
            Number(
              typeof item === 'number'
                ? item
                : item.probability ?? item.confidence
            )
          )
        : Object.values(result.probabilities).map(Number);

      const validValues = values.filter(
        value => Number.isFinite(value)
      );

      if (validValues.length > 0) {
        confidence = Math.max(...validValues);
      }
    }

    // Step 3: Save the prediction to PostgreSQL.
    
    const priority = assessTriagePriority(req.body);

    const savedResult = await pool.query(
    queries.insertAiPrediction,
    [
        Number(req.body.patient_id),
        result.prediction,
        confidence,
        result.model ?? null,
        result.model_version ?? null,
        JSON.stringify({
        fever: req.body.fever,
        cough: req.body.cough,
        rash: req.body.rash,
        headache: req.body.headache,
        vomiting: req.body.vomiting,
        fatigue: req.body.fatigue,
        sore_throat: req.body.sore_throat,
        breathing_issue: req.body.breathing_issue,
        age: req.body.age,
        gender: req.body.gender,
        temperature: req.body.temperature,
        days_symptoms: req.body.days_symptoms,
        travel_history: req.body.travel_history
        }),
        priority
    ]
    );

    return res.status(201).json({
    success: true,
    message: 'Prediction generated and saved successfully.',
    data: {
        ...result,
        patient_id: Number(req.body.patient_id),
        confidence,
        priority,
        savedPrediction: savedResult.rows[0]
    }
    });

  } catch (error) {
    console.error('AI prediction/database save error:', error);

    return res.status(500).json({
      success: false,
      message: 'Prediction or database save failed.',
      error: error.message
    });
  }
};

const getRecentAiTriageCases = async (req, res) => {
  try {
    const result = await pool.query(queries.getRecentAiPredictions);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error retrieving AI triage cases:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve AI triage cases.'
    });
  }
};


const assessTriagePriority = (input) => {
  const breathingIssue = Number(input.breathing_issue) === 1;
  const fever = Number(input.fever) === 1;
  const vomiting = Number(input.vomiting) === 1;
  const rash = Number(input.rash) === 1;

  if (breathingIssue) {
    return 'High';
  }

  if (fever && (vomiting || rash)) {
    return 'Moderate';
  }

  return 'Low';
};


const createPatient = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone
    } = req.body;

    if (!first_name?.trim() || !last_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required.'
      });
    }

    const result = await pool.query(
      queries.createPatient,
      [
        first_name.trim(),
        last_name.trim(),
        email?.trim() || null,
        phone?.trim() || null,
        await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10)
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Patient created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Patient creation failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create patient.'
    });
  }
};



// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {

    // Authentication
    addUser,
    login,
    getCurrentUser,

    // Patients
    getPatients,
    getPatientById,

    // Services
    getServices,

    // Doctors
    getDoctors,
    getDoctorById,
    getDoctorsByService,

    // Appointments
    bookAppointment,
    getAppointments,
    getAppointmentsByPatient,
    getAppointmentById,
    cancelAppointment,

    // Medical records
    getMedicalRecords,
    getMedicalRecordById,

    // Prescriptions
    getPrescriptions,

    // Messages
    getMessages,
    sendMessage,
    markMessageRead,

    // Health tips
    getHealthTips,

    // Symptoms
    getSymptoms,

    // Dashboard
    getDashboardStats,
    getNurses,
    getCurrentDatasetEda,
    getAiAnalytics,
    predictDisease,
    getRecentAiTriageCases,
    createPatient

};