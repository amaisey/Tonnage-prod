// Correcting Course - Full 4-Week Phase 1 Program

export const defaultFolders = [
  // Correcting Course - Phase 1 (4 weeks)
  { id: 'correcting-course', name: 'Correcting Course', parentId: 'root' },
  { id: 'cc-p1-w1', name: 'P1 - Week 1', parentId: 'correcting-course' },
  { id: 'cc-p1-w2', name: 'P1 - Week 2', parentId: 'correcting-course' },
  { id: 'cc-p1-w3', name: 'P1 - Week 3', parentId: 'correcting-course' },
  { id: 'cc-p1-w4', name: 'P1 - Week 4', parentId: 'correcting-course' },
];

export const sampleTemplates = [
  {
    "id": "cc-1000",
    "name": "P1/W1/D1 - Push",
    "folderId": "cc-p1-w1",
    "estimatedTime": 65,
    "notes": "75% intensity. Incline Dumbbell Press, Cable Fly. Red band.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Dislocates",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "red",
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Cat-Cow",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Push-Up to Down Dog",
        "bodyPart": "Chest",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 8
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Scapular Push-Ups",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 10
          }
        ]
      },
      {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 220,
            "reps": 5
          },
          {
            "weight": 220,
            "reps": 5
          },
          {
            "weight": 220,
            "reps": 5
          }
        ],
        "supersetId": "SS1",
        "notes": "75%",
        "highlight": true
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "workout",
        "restTime": 150,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Overhead Press",
        "bodyPart": "Shoulders",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 100,
            "reps": 8
          },
          {
            "weight": 100,
            "reps": 8
          },
          {
            "weight": 100,
            "reps": 8
          }
        ],
        "supersetId": "SS2",
        "highlight": true
      },
      {
        "name": "Band External Rotation",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Incline Dumbbell Press",
        "bodyPart": "Chest",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 55,
            "reps": 10
          },
          {
            "weight": 55,
            "reps": 10
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "weight": 55,
            "reps": 20
          },
          {
            "weight": 55,
            "reps": 20
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Cable Fly",
        "bodyPart": "Chest",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 35,
            "reps": 12
          },
          {
            "weight": 35,
            "reps": 12
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 55,
            "reps": 20
          },
          {
            "weight": 55,
            "reps": 20
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Triceps Pushdown",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 12
          },
          {
            "weight": 45,
            "reps": 12
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      },
      {
        "name": "Upper Trap Stretch",
        "bodyPart": "Shoulders",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 45
          },
          {
            "duration": 45
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1001",
    "name": "P1/W1/D2 - Legs (Quad)",
    "folderId": "cc-p1-w1",
    "estimatedTime": 70,
    "notes": "75% intensity. Front Squat, Seated Leg Curl.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Leg Swings (Front/Back)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Leg Swings (Lateral)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Walking Lunges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Bodyweight Squats",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Glute Bridges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Fire Hydrants",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "90/90 Hip Switches",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 16
          }
        ]
      },
      {
        "name": "Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 180,
        "sets": [
          {
            "weight": 250,
            "reps": 5
          },
          {
            "weight": 250,
            "reps": 5
          },
          {
            "weight": 250,
            "reps": 5
          },
          {
            "weight": 250,
            "reps": 5
          },
          {
            "weight": 250,
            "reps": 5
          }
        ],
        "notes": "75%",
        "highlight": true
      },
      {
        "name": "Front Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 115,
            "reps": 8
          },
          {
            "weight": 115,
            "reps": 8
          },
          {
            "weight": 115,
            "reps": 8
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Seated Leg Curl",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "weight": 75,
            "reps": 12
          },
          {
            "weight": 75,
            "reps": 12
          },
          {
            "weight": 75,
            "reps": 12
          }
        ],
        "supersetId": "SS1",
        "notes": "Hamstring balance"
      },
      {
        "name": "Leg Press",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 230,
            "reps": 12
          },
          {
            "weight": 230,
            "reps": 12
          },
          {
            "weight": 230,
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Seated Leg Curl",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "weight": 75,
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Standing Calf Raise",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Hanging Leg Raise",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "reps": 15
          },
          {
            "reps": 15
          },
          {
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Couch Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ],
        "notes": "Hip flexor - KEY",
        "highlight": true
      },
      {
        "name": "Pigeon Pose",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ]
      },
      {
        "name": "Supine Twist",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1002",
    "name": "P1/W1/D3 - Pull",
    "folderId": "cc-p1-w1",
    "estimatedTime": 65,
    "notes": "Barbell Row, Seated Cable Row, Hammer Curl. Red band.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Dislocates",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "red",
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Cat-Cow",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Scapular Pull-Ups",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Pull-Up",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "reps": 8
          },
          {
            "reps": 8
          },
          {
            "reps": 8
          },
          {
            "reps": 8
          }
        ],
        "supersetId": "SS1",
        "notes": "Bodyweight",
        "highlight": true
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "workout",
        "restTime": 120,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Barbell Row",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 155,
            "reps": 8
          },
          {
            "weight": 155,
            "reps": 8
          },
          {
            "weight": 155,
            "reps": 8
          },
          {
            "weight": 155,
            "reps": 8
          }
        ],
        "supersetId": "SS2",
        "highlight": true
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "weight": 55,
            "reps": 20
          },
          {
            "weight": 55,
            "reps": 20
          },
          {
            "weight": 55,
            "reps": 20
          },
          {
            "weight": 55,
            "reps": 20
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Seated Cable Row",
        "bodyPart": "Back",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 100,
            "reps": 12
          },
          {
            "weight": 100,
            "reps": 12
          },
          {
            "weight": 100,
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Reverse Pec Deck",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 75,
            "reps": 15
          },
          {
            "weight": 75,
            "reps": 15
          },
          {
            "weight": 75,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Hammer Curl",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 30,
            "reps": 12
          },
          {
            "weight": 30,
            "reps": 12
          },
          {
            "weight": 30,
            "reps": 12
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Shrug",
        "bodyPart": "Back",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 155,
            "reps": 12
          },
          {
            "weight": 155,
            "reps": 12
          },
          {
            "weight": 155,
            "reps": 12
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1003",
    "name": "P1/W1/D4 - Legs (Hinge)",
    "folderId": "cc-p1-w1",
    "estimatedTime": 70,
    "notes": "75% intensity. Romanian Deadlift (Dumbbell), Hip Thrust (Barbell), Seated Leg Curl.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Leg Swings (Front/Back)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Leg Swings (Lateral)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Walking Lunges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Glute Bridges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Fire Hydrants",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "90/90 Hip Switches",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 16
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Deadlift",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Deadlift",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "workout",
        "restTime": 180,
        "sets": [
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          }
        ],
        "notes": "75%",
        "highlight": true
      },
      {
        "name": "Romanian Deadlift (Dumbbell)",
        "bodyPart": "Legs",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 50,
            "reps": 10
          },
          {
            "weight": 50,
            "reps": 10
          },
          {
            "weight": 50,
            "reps": 10
          },
          {
            "weight": 50,
            "reps": 10
          }
        ],
        "supersetId": "SS1",
        "notes": "Hamstring focus",
        "highlight": true
      },
      {
        "name": "Dead Bug",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "reps": 20
          },
          {
            "reps": 20
          },
          {
            "reps": 20
          },
          {
            "reps": 20
          }
        ],
        "supersetId": "SS1",
        "notes": "10 per side"
      },
      {
        "name": "Hip Thrust (Barbell)",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 165,
            "reps": 10
          },
          {
            "weight": 165,
            "reps": 10
          },
          {
            "weight": 165,
            "reps": 10
          },
          {
            "weight": 165,
            "reps": 10
          }
        ],
        "supersetId": "SS2",
        "notes": "Glute focus",
        "highlight": true
      },
      {
        "name": "Seated Leg Curl",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "weight": 75,
            "reps": 12
          },
          {
            "weight": 75,
            "reps": 12
          },
          {
            "weight": 75,
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Cable Pull Through",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Pallof Press",
        "bodyPart": "Core",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 70,
            "reps": 20
          },
          {
            "weight": 70,
            "reps": 20
          },
          {
            "weight": 70,
            "reps": 20
          }
        ],
        "supersetId": "SS3",
        "notes": "10 per side"
      },
      {
        "name": "Couch Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ],
        "notes": "Hip flexor - KEY",
        "highlight": true
      },
      {
        "name": "Supine Twist",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1004",
    "name": "P1/W1/D5 - Arms/Shoulders",
    "folderId": "cc-p1-w1",
    "estimatedTime": 55,
    "notes": "Arnold Press, Lateral Raise (Dumbbell), Preacher Curl (Barbell), Skullcrusher (Barbell).",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band External Rotation",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "workout",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ]
      },
      {
        "name": "Arnold Press",
        "bodyPart": "Shoulders",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 35,
            "reps": 12
          },
          {
            "weight": 35,
            "reps": 12
          },
          {
            "weight": 35,
            "reps": 12
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 55,
            "reps": 20
          },
          {
            "weight": 55,
            "reps": 20
          },
          {
            "weight": 55,
            "reps": 20
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Lateral Raise (Dumbbell)",
        "bodyPart": "Shoulders",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 45,
        "sets": [
          {
            "weight": 15,
            "reps": 12
          },
          {
            "weight": 15,
            "reps": 12
          },
          {
            "weight": 15,
            "reps": 12
          },
          {
            "weight": 15,
            "reps": 12
          }
        ]
      },
      {
        "name": "Preacher Curl (Barbell)",
        "bodyPart": "Arms",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          },
          {
            "weight": 45,
            "reps": 10
          },
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Skullcrusher (Barbell)",
        "bodyPart": "Arms",
        "category": "barbell",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 50,
            "reps": 10
          },
          {
            "weight": 50,
            "reps": 10
          },
          {
            "weight": 50,
            "reps": 10
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Incline Curl (Dumbbell)",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 20,
            "reps": 12
          },
          {
            "weight": 20,
            "reps": 12
          },
          {
            "weight": 20,
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Triceps Extension (Cable)",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 15
          },
          {
            "weight": 45,
            "reps": 15
          },
          {
            "weight": 45,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Cable Crunch",
        "bodyPart": "Core",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 85,
            "reps": 15
          },
          {
            "weight": 85,
            "reps": 15
          },
          {
            "weight": 85,
            "reps": 15
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "L-Sit Hold",
        "bodyPart": "Core",
        "category": "duration",
        "phase": "workout",
        "restTime": 45,
        "sets": [
          {
            "duration": 15
          },
          {
            "duration": 15
          },
          {
            "duration": 15
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1005",
    "name": "P1/W1/D6 - Run",
    "folderId": "cc-p1-w1",
    "estimatedTime": 40,
    "notes": "3 miles conversational pace.",
    "exercises": [
      {
        "name": "Outdoor Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "distance": 4.8,
            "duration": 1800
          }
        ],
        "notes": "Conversational pace",
        "highlight": true
      },
      {
        "name": "Standing Quad Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Standing Hamstring Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Kneeling Hip Flexor Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Calf Stretch (Wall)",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 45
          },
          {
            "duration": 45
          }
        ]
      },
      {
        "name": "Pigeon Pose",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1006",
    "name": "P1/W2/D1 - Push",
    "folderId": "cc-p1-w2",
    "estimatedTime": 65,
    "notes": "77% intensity. Incline Cable Press, Dumbbell Fly. Red band.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Dislocates",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "red",
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Cat-Cow",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Push-Up to Down Dog",
        "bodyPart": "Chest",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 8
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Scapular Push-Ups",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 10
          }
        ]
      },
      {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 225,
            "reps": 5
          },
          {
            "weight": 225,
            "reps": 5
          },
          {
            "weight": 225,
            "reps": 5
          }
        ],
        "supersetId": "SS1",
        "notes": "77%",
        "highlight": true
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "workout",
        "restTime": 150,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Overhead Press",
        "bodyPart": "Shoulders",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 105,
            "reps": 8
          },
          {
            "weight": 105,
            "reps": 8
          },
          {
            "weight": 105,
            "reps": 8
          }
        ],
        "supersetId": "SS2",
        "highlight": true
      },
      {
        "name": "Band External Rotation",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Incline Cable Press",
        "bodyPart": "Chest",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 55,
            "reps": 10
          },
          {
            "weight": 55,
            "reps": 10
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "weight": 60,
            "reps": 20
          },
          {
            "weight": 60,
            "reps": 20
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Dumbbell Fly",
        "bodyPart": "Chest",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 30,
            "reps": 12
          },
          {
            "weight": 30,
            "reps": 12
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 60,
            "reps": 20
          },
          {
            "weight": 60,
            "reps": 20
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Overhead Triceps Extension",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 40,
            "reps": 12
          },
          {
            "weight": 40,
            "reps": 12
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      },
      {
        "name": "Upper Trap Stretch",
        "bodyPart": "Shoulders",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 45
          },
          {
            "duration": 45
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1007",
    "name": "P1/W2/D2 - Legs (Quad)",
    "folderId": "cc-p1-w2",
    "estimatedTime": 70,
    "notes": "77% intensity. Hack Squat, Prone Leg Curl.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Leg Swings (Front/Back)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Leg Swings (Lateral)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Walking Lunges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Bodyweight Squats",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Glute Bridges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Fire Hydrants",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "90/90 Hip Switches",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 16
          }
        ]
      },
      {
        "name": "Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 180,
        "sets": [
          {
            "weight": 260,
            "reps": 5
          },
          {
            "weight": 260,
            "reps": 5
          },
          {
            "weight": 260,
            "reps": 5
          },
          {
            "weight": 260,
            "reps": 5
          },
          {
            "weight": 260,
            "reps": 5
          }
        ],
        "notes": "77%",
        "highlight": true
      },
      {
        "name": "Hack Squat",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 170,
            "reps": 8
          },
          {
            "weight": 170,
            "reps": 8
          },
          {
            "weight": 170,
            "reps": 8
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Prone Leg Curl",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "weight": 65,
            "reps": 12
          },
          {
            "weight": 65,
            "reps": 12
          },
          {
            "weight": 65,
            "reps": 12
          }
        ],
        "supersetId": "SS1",
        "notes": "Hamstring balance"
      },
      {
        "name": "Leg Press",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 240,
            "reps": 12
          },
          {
            "weight": 240,
            "reps": 12
          },
          {
            "weight": 240,
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Prone Leg Curl",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "weight": 65,
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Seated Calf Raise",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 65,
            "reps": 15
          },
          {
            "weight": 65,
            "reps": 15
          },
          {
            "weight": 65,
            "reps": 15
          },
          {
            "weight": 65,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Hanging Leg Raise",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "reps": 15
          },
          {
            "reps": 15
          },
          {
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Couch Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ],
        "notes": "Hip flexor - KEY",
        "highlight": true
      },
      {
        "name": "Pigeon Pose",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ]
      },
      {
        "name": "Supine Twist",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1008",
    "name": "P1/W2/D3 - Pull",
    "folderId": "cc-p1-w2",
    "estimatedTime": 65,
    "notes": "T-Bar Row, Chest Supported Dumbbell Row, EZ Bar Curl. Red band.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Dislocates",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "red",
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Cat-Cow",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Scapular Pull-Ups",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Pull-Up",
        "bodyPart": "Back",
        "category": "weighted_bodyweight",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 5,
            "reps": 8
          },
          {
            "weight": 5,
            "reps": 8
          },
          {
            "weight": 5,
            "reps": 8
          },
          {
            "weight": 5,
            "reps": 8
          }
        ],
        "supersetId": "SS1",
        "notes": "+5 lbs",
        "highlight": true
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "workout",
        "restTime": 120,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "T-Bar Row",
        "bodyPart": "Back",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 125,
            "reps": 8
          },
          {
            "weight": 125,
            "reps": 8
          },
          {
            "weight": 125,
            "reps": 8
          },
          {
            "weight": 125,
            "reps": 8
          }
        ],
        "supersetId": "SS2",
        "highlight": true
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "weight": 60,
            "reps": 20
          },
          {
            "weight": 60,
            "reps": 20
          },
          {
            "weight": 60,
            "reps": 20
          },
          {
            "weight": 60,
            "reps": 20
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Chest Supported Dumbbell Row",
        "bodyPart": "Back",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 50,
            "reps": 12
          },
          {
            "weight": 50,
            "reps": 12
          },
          {
            "weight": 50,
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Reverse Pec Deck",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "EZ Bar Curl",
        "bodyPart": "Arms",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 60,
            "reps": 12
          },
          {
            "weight": 60,
            "reps": 12
          },
          {
            "weight": 60,
            "reps": 12
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Shrug",
        "bodyPart": "Back",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 165,
            "reps": 12
          },
          {
            "weight": 165,
            "reps": 12
          },
          {
            "weight": 165,
            "reps": 12
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1009",
    "name": "P1/W2/D4 - Legs (Hinge)",
    "folderId": "cc-p1-w2",
    "estimatedTime": 70,
    "notes": "77% intensity. Romanian Deadlift (Barbell), Hip Thrust (Machine), Prone Leg Curl.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Leg Swings (Front/Back)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Leg Swings (Lateral)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Walking Lunges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Glute Bridges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Fire Hydrants",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "90/90 Hip Switches",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 16
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Deadlift",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Deadlift",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "workout",
        "restTime": 180,
        "sets": [
          {
            "weight": 245,
            "reps": 5
          },
          {
            "weight": 245,
            "reps": 5
          },
          {
            "weight": 245,
            "reps": 5
          },
          {
            "weight": 245,
            "reps": 5
          }
        ],
        "notes": "77%",
        "highlight": true
      },
      {
        "name": "Romanian Deadlift (Barbell)",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 175,
            "reps": 10
          },
          {
            "weight": 175,
            "reps": 10
          },
          {
            "weight": 175,
            "reps": 10
          },
          {
            "weight": 175,
            "reps": 10
          }
        ],
        "supersetId": "SS1",
        "notes": "Hamstring focus",
        "highlight": true
      },
      {
        "name": "Dead Bug",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "reps": 20
          },
          {
            "reps": 20
          },
          {
            "reps": 20
          },
          {
            "reps": 20
          }
        ],
        "supersetId": "SS1",
        "notes": "10 per side"
      },
      {
        "name": "Hip Thrust (Machine)",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 185,
            "reps": 10
          },
          {
            "weight": 185,
            "reps": 10
          },
          {
            "weight": 185,
            "reps": 10
          },
          {
            "weight": 185,
            "reps": 10
          }
        ],
        "supersetId": "SS2",
        "notes": "Glute focus",
        "highlight": true
      },
      {
        "name": "Prone Leg Curl",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "weight": 65,
            "reps": 12
          },
          {
            "weight": 65,
            "reps": 12
          },
          {
            "weight": 65,
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Kettlebell Swing",
        "bodyPart": "Legs",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 50,
            "reps": 15
          },
          {
            "weight": 50,
            "reps": 15
          },
          {
            "weight": 50,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Pallof Press",
        "bodyPart": "Core",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 75,
            "reps": 20
          },
          {
            "weight": 75,
            "reps": 20
          },
          {
            "weight": 75,
            "reps": 20
          }
        ],
        "supersetId": "SS3",
        "notes": "10 per side"
      },
      {
        "name": "Couch Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ],
        "notes": "Hip flexor - KEY",
        "highlight": true
      },
      {
        "name": "Supine Twist",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1010",
    "name": "P1/W2/D5 - Arms/Shoulders",
    "folderId": "cc-p1-w2",
    "estimatedTime": 55,
    "notes": "Seated Dumbbell Press, Cable Lateral Raise, Preacher Curl (Dumbbell), Skullcrusher (Dumbbell).",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band External Rotation",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "workout",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ]
      },
      {
        "name": "Seated Dumbbell Press",
        "bodyPart": "Shoulders",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 45,
            "reps": 12
          },
          {
            "weight": 45,
            "reps": 12
          },
          {
            "weight": 45,
            "reps": 12
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 60,
            "reps": 20
          },
          {
            "weight": 60,
            "reps": 20
          },
          {
            "weight": 60,
            "reps": 20
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Cable Lateral Raise",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 45,
        "sets": [
          {
            "weight": 15,
            "reps": 12
          },
          {
            "weight": 15,
            "reps": 12
          },
          {
            "weight": 15,
            "reps": 12
          },
          {
            "weight": 15,
            "reps": 12
          }
        ]
      },
      {
        "name": "Preacher Curl (Dumbbell)",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 27.5,
            "reps": 10
          },
          {
            "weight": 27.5,
            "reps": 10
          },
          {
            "weight": 27.5,
            "reps": 10
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Skullcrusher (Dumbbell)",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 27.5,
            "reps": 10
          },
          {
            "weight": 27.5,
            "reps": 10
          },
          {
            "weight": 27.5,
            "reps": 10
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Incline Curl (Dumbbell)",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 22.5,
            "reps": 12
          },
          {
            "weight": 22.5,
            "reps": 12
          },
          {
            "weight": 22.5,
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Triceps Extension (Cable)",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 47.5,
            "reps": 15
          },
          {
            "weight": 47.5,
            "reps": 15
          },
          {
            "weight": 47.5,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Cable Crunch",
        "bodyPart": "Core",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 90,
            "reps": 15
          },
          {
            "weight": 90,
            "reps": 15
          },
          {
            "weight": 90,
            "reps": 15
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "L-Sit Hold",
        "bodyPart": "Core",
        "category": "duration",
        "phase": "workout",
        "restTime": 45,
        "sets": [
          {
            "duration": 17
          },
          {
            "duration": 17
          },
          {
            "duration": 17
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1011",
    "name": "P1/W2/D6 - Run",
    "folderId": "cc-p1-w2",
    "estimatedTime": 45,
    "notes": "3.5 miles moderate pace.",
    "exercises": [
      {
        "name": "Outdoor Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "distance": 5.6,
            "duration": 2100
          }
        ],
        "notes": "Moderate pace",
        "highlight": true
      },
      {
        "name": "Standing Quad Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Standing Hamstring Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Kneeling Hip Flexor Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Calf Stretch (Wall)",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 45
          },
          {
            "duration": 45
          }
        ]
      },
      {
        "name": "Pigeon Pose",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1012",
    "name": "P1/W3/D1 - Push",
    "folderId": "cc-p1-w3",
    "estimatedTime": 65,
    "notes": "80% PEAK intensity. Incline Machine Press, Pec Deck. Green band.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "green",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Dislocates",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "green",
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Cat-Cow",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Push-Up to Down Dog",
        "bodyPart": "Chest",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 8
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Scapular Push-Ups",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 10
          }
        ]
      },
      {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          }
        ],
        "supersetId": "SS1",
        "notes": "80% PEAK",
        "highlight": true
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "workout",
        "restTime": 150,
        "sets": [
          {
            "bandColor": "green",
            "reps": 15
          },
          {
            "bandColor": "green",
            "reps": 15
          },
          {
            "bandColor": "green",
            "reps": 15
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Overhead Press",
        "bodyPart": "Shoulders",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 115,
            "reps": 8
          },
          {
            "weight": 115,
            "reps": 8
          },
          {
            "weight": 115,
            "reps": 8
          }
        ],
        "supersetId": "SS2",
        "highlight": true
      },
      {
        "name": "Band External Rotation",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "bandColor": "green",
            "reps": 15
          },
          {
            "bandColor": "green",
            "reps": 15
          },
          {
            "bandColor": "green",
            "reps": 15
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Incline Machine Press",
        "bodyPart": "Chest",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 90,
            "reps": 10
          },
          {
            "weight": 90,
            "reps": 10
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "weight": 65,
            "reps": 20
          },
          {
            "weight": 65,
            "reps": 20
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Pec Deck",
        "bodyPart": "Chest",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 60,
            "reps": 12
          },
          {
            "weight": 60,
            "reps": 12
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 65,
            "reps": 20
          },
          {
            "weight": 65,
            "reps": 20
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Triceps Pushdown",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 50,
            "reps": 12
          },
          {
            "weight": 50,
            "reps": 12
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      },
      {
        "name": "Upper Trap Stretch",
        "bodyPart": "Shoulders",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 45
          },
          {
            "duration": 45
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1013",
    "name": "P1/W3/D2 - Legs (Quad)",
    "folderId": "cc-p1-w3",
    "estimatedTime": 70,
    "notes": "80% PEAK intensity. Goblet Squat, Nordic Curl (Assisted).",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Leg Swings (Front/Back)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Leg Swings (Lateral)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Walking Lunges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Bodyweight Squats",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Glute Bridges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Fire Hydrants",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "90/90 Hip Switches",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 16
          }
        ]
      },
      {
        "name": "Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 180,
        "sets": [
          {
            "weight": 270,
            "reps": 5
          },
          {
            "weight": 270,
            "reps": 5
          },
          {
            "weight": 270,
            "reps": 5
          },
          {
            "weight": 270,
            "reps": 5
          },
          {
            "weight": 270,
            "reps": 5
          }
        ],
        "notes": "80% PEAK",
        "highlight": true
      },
      {
        "name": "Goblet Squat",
        "bodyPart": "Legs",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 70,
            "reps": 8
          },
          {
            "weight": 70,
            "reps": 8
          },
          {
            "weight": 70,
            "reps": 8
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Nordic Curl (Assisted)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "reps": 8
          },
          {
            "reps": 8
          },
          {
            "reps": 8
          }
        ],
        "supersetId": "SS1",
        "notes": "Hamstring balance"
      },
      {
        "name": "Leg Press",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 250,
            "reps": 12
          },
          {
            "weight": 250,
            "reps": 12
          },
          {
            "weight": 250,
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Nordic Curl (Assisted)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "reps": 8
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Leg Press Calf Raise",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 210,
            "reps": 15
          },
          {
            "weight": 210,
            "reps": 15
          },
          {
            "weight": 210,
            "reps": 15
          },
          {
            "weight": 210,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Hanging Leg Raise",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "reps": 15
          },
          {
            "reps": 15
          },
          {
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Couch Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ],
        "notes": "Hip flexor - KEY",
        "highlight": true
      },
      {
        "name": "Pigeon Pose",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ]
      },
      {
        "name": "Supine Twist",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1014",
    "name": "P1/W3/D3 - Pull",
    "folderId": "cc-p1-w3",
    "estimatedTime": 65,
    "notes": "Pendlay Row, Single Arm Cable Row, Cable Curl. Green band.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "green",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Dislocates",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "green",
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Cat-Cow",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Scapular Pull-Ups",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Pull-Up",
        "bodyPart": "Back",
        "category": "weighted_bodyweight",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 10,
            "reps": 8
          },
          {
            "weight": 10,
            "reps": 8
          },
          {
            "weight": 10,
            "reps": 8
          },
          {
            "weight": 10,
            "reps": 8
          }
        ],
        "supersetId": "SS1",
        "notes": "+10 lbs",
        "highlight": true
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "workout",
        "restTime": 120,
        "sets": [
          {
            "bandColor": "green",
            "reps": 15
          },
          {
            "bandColor": "green",
            "reps": 15
          },
          {
            "bandColor": "green",
            "reps": 15
          },
          {
            "bandColor": "green",
            "reps": 15
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Pendlay Row",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 175,
            "reps": 8
          },
          {
            "weight": 175,
            "reps": 8
          },
          {
            "weight": 175,
            "reps": 8
          },
          {
            "weight": 175,
            "reps": 8
          }
        ],
        "supersetId": "SS2",
        "highlight": true
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "weight": 65,
            "reps": 20
          },
          {
            "weight": 65,
            "reps": 20
          },
          {
            "weight": 65,
            "reps": 20
          },
          {
            "weight": 65,
            "reps": 20
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Single Arm Cable Row",
        "bodyPart": "Back",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 60,
            "reps": 12
          },
          {
            "weight": 60,
            "reps": 12
          },
          {
            "weight": 60,
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Reverse Pec Deck",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 85,
            "reps": 15
          },
          {
            "weight": 85,
            "reps": 15
          },
          {
            "weight": 85,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Cable Curl",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 50,
            "reps": 12
          },
          {
            "weight": 50,
            "reps": 12
          },
          {
            "weight": 50,
            "reps": 12
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Shrug",
        "bodyPart": "Back",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 175,
            "reps": 12
          },
          {
            "weight": 175,
            "reps": 12
          },
          {
            "weight": 175,
            "reps": 12
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1015",
    "name": "P1/W3/D4 - Legs (Hinge)",
    "folderId": "cc-p1-w3",
    "estimatedTime": 70,
    "notes": "80% PEAK intensity. Single Leg Romanian Deadlift, Glute Bridge (Barbell), Nordic Curl (Assisted).",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Leg Swings (Front/Back)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Leg Swings (Lateral)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Walking Lunges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Glute Bridges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Fire Hydrants",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "90/90 Hip Switches",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 16
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Deadlift",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Deadlift",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "workout",
        "restTime": 180,
        "sets": [
          {
            "weight": 255,
            "reps": 5
          },
          {
            "weight": 255,
            "reps": 5
          },
          {
            "weight": 255,
            "reps": 5
          },
          {
            "weight": 255,
            "reps": 5
          }
        ],
        "notes": "80% PEAK",
        "highlight": true
      },
      {
        "name": "Single Leg Romanian Deadlift",
        "bodyPart": "Legs",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 40,
            "reps": 10
          },
          {
            "weight": 40,
            "reps": 10
          },
          {
            "weight": 40,
            "reps": 10
          },
          {
            "weight": 40,
            "reps": 10
          }
        ],
        "supersetId": "SS1",
        "notes": "Hamstring focus",
        "highlight": true
      },
      {
        "name": "Dead Bug",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "reps": 20
          },
          {
            "reps": 20
          },
          {
            "reps": 20
          },
          {
            "reps": 20
          }
        ],
        "supersetId": "SS1",
        "notes": "10 per side"
      },
      {
        "name": "Glute Bridge (Barbell)",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 235,
            "reps": 10
          },
          {
            "weight": 235,
            "reps": 10
          },
          {
            "weight": 235,
            "reps": 10
          },
          {
            "weight": 235,
            "reps": 10
          }
        ],
        "supersetId": "SS2",
        "notes": "Glute focus",
        "highlight": true
      },
      {
        "name": "Nordic Curl (Assisted)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "reps": 8
          },
          {
            "reps": 8
          },
          {
            "reps": 8
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Good Morning",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 95,
            "reps": 15
          },
          {
            "weight": 95,
            "reps": 15
          },
          {
            "weight": 95,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Pallof Press",
        "bodyPart": "Core",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 85,
            "reps": 20
          },
          {
            "weight": 85,
            "reps": 20
          },
          {
            "weight": 85,
            "reps": 20
          }
        ],
        "supersetId": "SS3",
        "notes": "10 per side"
      },
      {
        "name": "Couch Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ],
        "notes": "Hip flexor - KEY",
        "highlight": true
      },
      {
        "name": "Supine Twist",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1016",
    "name": "P1/W3/D5 - Arms/Shoulders",
    "folderId": "cc-p1-w3",
    "estimatedTime": 55,
    "notes": "Machine Shoulder Press, Machine Lateral Raise, Spider Curl, Cable Overhead Extension.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "green",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band External Rotation",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "workout",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "green",
            "reps": 15
          },
          {
            "bandColor": "green",
            "reps": 15
          }
        ]
      },
      {
        "name": "Machine Shoulder Press",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 95,
            "reps": 12
          },
          {
            "weight": 95,
            "reps": 12
          },
          {
            "weight": 95,
            "reps": 12
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 65,
            "reps": 20
          },
          {
            "weight": 65,
            "reps": 20
          },
          {
            "weight": 65,
            "reps": 20
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Machine Lateral Raise",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 45,
        "sets": [
          {
            "weight": 50,
            "reps": 12
          },
          {
            "weight": 50,
            "reps": 12
          },
          {
            "weight": 50,
            "reps": 12
          },
          {
            "weight": 50,
            "reps": 12
          }
        ]
      },
      {
        "name": "Spider Curl",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 22.5,
            "reps": 10
          },
          {
            "weight": 22.5,
            "reps": 10
          },
          {
            "weight": 22.5,
            "reps": 10
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Cable Overhead Extension",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 50,
            "reps": 10
          },
          {
            "weight": 50,
            "reps": 10
          },
          {
            "weight": 50,
            "reps": 10
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Incline Curl (Dumbbell)",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 25,
            "reps": 12
          },
          {
            "weight": 25,
            "reps": 12
          },
          {
            "weight": 25,
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Triceps Extension (Cable)",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 50,
            "reps": 15
          },
          {
            "weight": 50,
            "reps": 15
          },
          {
            "weight": 50,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Cable Crunch",
        "bodyPart": "Core",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 100,
            "reps": 15
          },
          {
            "weight": 100,
            "reps": 15
          },
          {
            "weight": 100,
            "reps": 15
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "L-Sit Hold",
        "bodyPart": "Core",
        "category": "duration",
        "phase": "workout",
        "restTime": 45,
        "sets": [
          {
            "duration": 20
          },
          {
            "duration": 20
          },
          {
            "duration": 20
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1017",
    "name": "P1/W3/D6 - Run",
    "folderId": "cc-p1-w3",
    "estimatedTime": 50,
    "notes": "4 miles push pace - peak.",
    "exercises": [
      {
        "name": "Outdoor Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "distance": 6.4,
            "duration": 2400
          }
        ],
        "notes": "Push pace - peak",
        "highlight": true
      },
      {
        "name": "Standing Quad Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Standing Hamstring Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Kneeling Hip Flexor Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Calf Stretch (Wall)",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 45
          },
          {
            "duration": 45
          }
        ]
      },
      {
        "name": "Pigeon Pose",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1018",
    "name": "P1/W4/D1 - Push (DELOAD)",
    "folderId": "cc-p1-w4",
    "estimatedTime": 55,
    "notes": "70% DELOAD intensity. Low Incline Dumbbell Press, Cable Crossover (Low). Red band.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Dislocates",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "red",
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Cat-Cow",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Push-Up to Down Dog",
        "bodyPart": "Chest",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 8
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Scapular Push-Ups",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 10
          }
        ]
      },
      {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 205,
            "reps": 5
          },
          {
            "weight": 205,
            "reps": 5
          },
          {
            "weight": 205,
            "reps": 5
          }
        ],
        "supersetId": "SS1",
        "notes": "70% DELOAD",
        "highlight": true
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "workout",
        "restTime": 150,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Overhead Press",
        "bodyPart": "Shoulders",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 95,
            "reps": 8
          },
          {
            "weight": 95,
            "reps": 8
          },
          {
            "weight": 95,
            "reps": 8
          }
        ],
        "supersetId": "SS2",
        "highlight": true
      },
      {
        "name": "Band External Rotation",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Low Incline Dumbbell Press",
        "bodyPart": "Chest",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 50,
            "reps": 10
          },
          {
            "weight": 50,
            "reps": 10
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "weight": 50,
            "reps": 20
          },
          {
            "weight": 50,
            "reps": 20
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Cable Crossover (Low)",
        "bodyPart": "Chest",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 25,
            "reps": 12
          },
          {
            "weight": 25,
            "reps": 12
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 50,
            "reps": 20
          },
          {
            "weight": 50,
            "reps": 20
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Overhead Triceps Extension",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 40,
            "reps": 12
          },
          {
            "weight": 40,
            "reps": 12
          }
        ],
        "supersetId": "T1"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      },
      {
        "name": "Upper Trap Stretch",
        "bodyPart": "Shoulders",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 45
          },
          {
            "duration": 45
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1019",
    "name": "P1/W4/D2 - Legs (Quad) (DELOAD)",
    "folderId": "cc-p1-w4",
    "estimatedTime": 60,
    "notes": "70% DELOAD intensity. Bulgarian Split Squat, Stability Ball Leg Curl.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Leg Swings (Front/Back)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Leg Swings (Lateral)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Walking Lunges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Bodyweight Squats",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Glute Bridges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Fire Hydrants",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "90/90 Hip Switches",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 16
          }
        ]
      },
      {
        "name": "Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Squat",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 180,
        "sets": [
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          },
          {
            "weight": 235,
            "reps": 5
          }
        ],
        "notes": "70% DELOAD",
        "highlight": true
      },
      {
        "name": "Bulgarian Split Squat",
        "bodyPart": "Legs",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          },
          {
            "weight": 35,
            "reps": 8
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Stability Ball Leg Curl",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "reps": 12
          },
          {
            "reps": 12
          },
          {
            "reps": 12
          }
        ],
        "supersetId": "SS1",
        "notes": "Hamstring balance"
      },
      {
        "name": "Leg Press",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 230,
            "reps": 12
          },
          {
            "weight": 230,
            "reps": 12
          },
          {
            "weight": 230,
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Stability Ball Leg Curl",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Single Leg Calf Raise",
        "bodyPart": "Legs",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 40,
            "reps": 15
          },
          {
            "weight": 40,
            "reps": 15
          },
          {
            "weight": 40,
            "reps": 15
          },
          {
            "weight": 40,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Hanging Leg Raise",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "reps": 12
          },
          {
            "reps": 12
          },
          {
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Couch Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ],
        "notes": "Hip flexor - KEY",
        "highlight": true
      },
      {
        "name": "Pigeon Pose",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ]
      },
      {
        "name": "Supine Twist",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1020",
    "name": "P1/W4/D3 - Pull (DELOAD)",
    "folderId": "cc-p1-w4",
    "estimatedTime": 55,
    "notes": "Meadows Row, Machine Row, Incline Dumbbell Curl. Red band.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Dislocates",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "red",
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Cat-Cow",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Scapular Pull-Ups",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 10
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Pull-Up",
        "bodyPart": "Back",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "reps": 8
          },
          {
            "reps": 8
          },
          {
            "reps": 8
          },
          {
            "reps": 8
          }
        ],
        "supersetId": "SS1",
        "notes": "Bodyweight deload",
        "highlight": true
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "workout",
        "restTime": 120,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Meadows Row",
        "bodyPart": "Back",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 60,
            "reps": 8
          },
          {
            "weight": 60,
            "reps": 8
          },
          {
            "weight": 60,
            "reps": 8
          },
          {
            "weight": 60,
            "reps": 8
          }
        ],
        "supersetId": "SS2",
        "highlight": true
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "weight": 50,
            "reps": 20
          },
          {
            "weight": 50,
            "reps": 20
          },
          {
            "weight": 50,
            "reps": 20
          },
          {
            "weight": 50,
            "reps": 20
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Machine Row",
        "bodyPart": "Back",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 115,
            "reps": 12
          },
          {
            "weight": 115,
            "reps": 12
          },
          {
            "weight": 115,
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Reverse Pec Deck",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 70,
            "reps": 15
          },
          {
            "weight": 70,
            "reps": 15
          },
          {
            "weight": 70,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Incline Dumbbell Curl",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 20,
            "reps": 12
          },
          {
            "weight": 20,
            "reps": 12
          },
          {
            "weight": 20,
            "reps": 12
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Shrug",
        "bodyPart": "Back",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 150,
            "reps": 12
          },
          {
            "weight": 150,
            "reps": 12
          },
          {
            "weight": 150,
            "reps": 12
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1021",
    "name": "P1/W4/D4 - Legs (Hinge) (DELOAD)",
    "folderId": "cc-p1-w4",
    "estimatedTime": 60,
    "notes": "70% DELOAD intensity. Stiff Leg Deadlift, Single Leg Hip Thrust, Stability Ball Leg Curl.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Leg Swings (Front/Back)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Leg Swings (Lateral)",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 30
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Walking Lunges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Glute Bridges",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 15
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Fire Hydrants",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "90/90 Hip Switches",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "reps": 16
          }
        ],
        "supersetId": "W2"
      },
      {
        "name": "Deadlift",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "weight": 45,
            "reps": 10
          }
        ],
        "notes": "Empty bar"
      },
      {
        "name": "Deadlift",
        "bodyPart": "Back",
        "category": "barbell",
        "phase": "workout",
        "restTime": 180,
        "sets": [
          {
            "weight": 220,
            "reps": 5
          },
          {
            "weight": 220,
            "reps": 5
          },
          {
            "weight": 220,
            "reps": 5
          },
          {
            "weight": 220,
            "reps": 5
          }
        ],
        "notes": "70% DELOAD",
        "highlight": true
      },
      {
        "name": "Stiff Leg Deadlift",
        "bodyPart": "Legs",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 145,
            "reps": 10
          },
          {
            "weight": 145,
            "reps": 10
          },
          {
            "weight": 145,
            "reps": 10
          },
          {
            "weight": 145,
            "reps": 10
          }
        ],
        "supersetId": "SS1",
        "notes": "Hamstring focus",
        "highlight": true
      },
      {
        "name": "Dead Bug",
        "bodyPart": "Core",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 90,
        "sets": [
          {
            "reps": 20
          },
          {
            "reps": 20
          },
          {
            "reps": 20
          },
          {
            "reps": 20
          }
        ],
        "supersetId": "SS1",
        "notes": "10 per side"
      },
      {
        "name": "Single Leg Hip Thrust",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "reps": 10
          },
          {
            "reps": 10
          },
          {
            "reps": 10
          },
          {
            "reps": 10
          }
        ],
        "supersetId": "SS2",
        "notes": "Glute focus",
        "highlight": true
      },
      {
        "name": "Stability Ball Leg Curl",
        "bodyPart": "Legs",
        "category": "reps_only",
        "phase": "workout",
        "restTime": 75,
        "sets": [
          {
            "reps": 12
          },
          {
            "reps": 12
          },
          {
            "reps": 12
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Band Pull Through",
        "bodyPart": "Legs",
        "category": "band",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Pallof Press",
        "bodyPart": "Core",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 70,
            "reps": 20
          },
          {
            "weight": 70,
            "reps": 20
          },
          {
            "weight": 70,
            "reps": 20
          }
        ],
        "supersetId": "SS3",
        "notes": "10 per side"
      },
      {
        "name": "Couch Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 90
          },
          {
            "duration": 90
          }
        ],
        "notes": "Hip flexor - KEY",
        "highlight": true
      },
      {
        "name": "Supine Twist",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1022",
    "name": "P1/W4/D5 - Arms/Shoulders (DELOAD)",
    "folderId": "cc-p1-w4",
    "estimatedTime": 50,
    "notes": "Landmine Press, Leaning Lateral Raise, Concentration Curl, JM Press.",
    "exercises": [
      {
        "name": "Treadmill Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "warmup",
        "restTime": 60,
        "sets": [
          {
            "distance": 1.6,
            "duration": 480
          }
        ]
      },
      {
        "name": "Arm Circles (Forward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Arm Circles (Backward)",
        "bodyPart": "Shoulders",
        "category": "reps_only",
        "phase": "warmup",
        "restTime": 0,
        "sets": [
          {
            "reps": 20
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band Pull-Aparts",
        "bodyPart": "Back",
        "category": "band",
        "phase": "warmup",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          }
        ],
        "supersetId": "W1"
      },
      {
        "name": "Band External Rotation",
        "bodyPart": "Shoulders",
        "category": "band",
        "phase": "workout",
        "restTime": 30,
        "sets": [
          {
            "bandColor": "red",
            "reps": 15
          },
          {
            "bandColor": "red",
            "reps": 15
          }
        ]
      },
      {
        "name": "Landmine Press",
        "bodyPart": "Shoulders",
        "category": "barbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 60,
            "reps": 12
          },
          {
            "weight": 60,
            "reps": 12
          },
          {
            "weight": 60,
            "reps": 12
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Face Pull",
        "bodyPart": "Shoulders",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 50,
            "reps": 20
          },
          {
            "weight": 50,
            "reps": 20
          },
          {
            "weight": 50,
            "reps": 20
          }
        ],
        "supersetId": "SS1"
      },
      {
        "name": "Leaning Lateral Raise",
        "bodyPart": "Shoulders",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 45,
        "sets": [
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          },
          {
            "weight": 10,
            "reps": 12
          }
        ]
      },
      {
        "name": "Concentration Curl",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 20,
            "reps": 10
          },
          {
            "weight": 20,
            "reps": 10
          },
          {
            "weight": 20,
            "reps": 10
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "JM Press",
        "bodyPart": "Arms",
        "category": "barbell",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 80,
            "reps": 10
          },
          {
            "weight": 80,
            "reps": 10
          },
          {
            "weight": 80,
            "reps": 10
          }
        ],
        "supersetId": "SS2"
      },
      {
        "name": "Incline Curl (Dumbbell)",
        "bodyPart": "Arms",
        "category": "dumbbell",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 20,
            "reps": 12
          },
          {
            "weight": 20,
            "reps": 12
          },
          {
            "weight": 20,
            "reps": 12
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Triceps Extension (Cable)",
        "bodyPart": "Arms",
        "category": "machine",
        "phase": "workout",
        "restTime": 60,
        "sets": [
          {
            "weight": 40,
            "reps": 15
          },
          {
            "weight": 40,
            "reps": 15
          },
          {
            "weight": 40,
            "reps": 15
          }
        ],
        "supersetId": "SS3"
      },
      {
        "name": "Cable Crunch",
        "bodyPart": "Core",
        "category": "machine",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          },
          {
            "weight": 80,
            "reps": 15
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "L-Sit Hold",
        "bodyPart": "Core",
        "category": "duration",
        "phase": "workout",
        "restTime": 45,
        "sets": [
          {
            "duration": 15
          },
          {
            "duration": 15
          },
          {
            "duration": 15
          }
        ],
        "supersetId": "SS4"
      },
      {
        "name": "Doorway Pec Stretch",
        "bodyPart": "Chest",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Foam Roller Thoracic Extension",
        "bodyPart": "Back",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 120
          }
        ]
      }
    ]
  },
  {
    "id": "cc-1023",
    "name": "P1/W4/D6 - Run (DELOAD)",
    "folderId": "cc-p1-w4",
    "estimatedTime": 30,
    "notes": "2.5 miles easy recovery pace.",
    "exercises": [
      {
        "name": "Outdoor Run",
        "bodyPart": "Cardio",
        "category": "cardio",
        "phase": "workout",
        "restTime": 0,
        "sets": [
          {
            "distance": 4,
            "duration": 1500
          }
        ],
        "notes": "Easy recovery pace",
        "highlight": true
      },
      {
        "name": "Standing Quad Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Standing Hamstring Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Kneeling Hip Flexor Stretch",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      },
      {
        "name": "Calf Stretch (Wall)",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 45
          },
          {
            "duration": 45
          }
        ]
      },
      {
        "name": "Pigeon Pose",
        "bodyPart": "Legs",
        "category": "duration",
        "phase": "cooldown",
        "restTime": 0,
        "sets": [
          {
            "duration": 60
          },
          {
            "duration": 60
          }
        ]
      }
    ]
  }
];
