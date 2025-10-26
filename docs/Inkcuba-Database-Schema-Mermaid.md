erDiagram
portfolio ||--o{ users : references
portfolio ||--o{ users : references
portfolio_members ||--o{ portfolio : references
portfolio_members }o--|| users : references
portfolio_assets ||--o{ portfolio : references
portfolio_feedback ||--|| portfolio : references
portfolio_feedback ||--o{ users : references
activity_log ||--o{ users : references

    portfolio {
    	INTEGER portfolio_id
    	VARCHAR(255) title
    	TEXT desc
    	PORTFOLIO_TYPE type
    	INTEGER student_id
    	INTEGER lecturer_id
    	PORTFOLIO_STATUS status
    	TIMESTAMP created_at
    	TIMESTAMP updated_at
    }

    users {
    	INTEGER user_id
    	VARCHAR(255) name
    	VARCHAR(255) email
    	VARCHAR(255) password
    	USER_ROLE role
    	USER_STATUS status
    	TIMESTAMP created_at
    	TIMESTAMP updated_at
    }

    portfolio_members {
    	INTEGER id
    	INTEGER portfolio_id
    	INTEGER student_id
    }

    portfolio_assets {
    	INTEGER asset_id
    	INTEGER portfolio_id
    	ASSET_TYPE asset_type
    	VARCHAR(255) file_path
    	VARCHAR(255) file_name
    	TIMESTAMP created_at
    	TIMESTAMP uploaded_at
    }

    portfolio_feedback {
    	INTEGER feedback_id
    	INTEGER portfolio_id
    	INTEGER lecturer_id
    	TEXT feedback_text
    	STATUS_CHANGE status_change
    	TIMESTAMP created_at
    	TIMESTAMP updated_at
    }

    activity_log {
    	INTEGER log_id
    	INTEGER user_id
    	ACTIVITY_TYPE activity_type
    	TEXT description
    	TIMESTAMP timestamp
    }
