Run appleboy/ssh-action@v1.0.3
  with:
    host: ***
    username: ***
    password: ***
    port: 22
    script: # Make sure deployment directory exists
  mkdir -p ~/sinopiquest-deploy
  cd ~/sinopiquest-deploy
  
  # Convert repo name to lowercase for Docker image reference
  REPO_LOWER=$(echo "brianwibowo/NusaQuest_RPG" | tr '[:upper:]' '[:lower:]')
  
  # Login to GitHub Container Registry on VPS
  echo "***" | docker login ghcr.io -u brianwibowo --password-stdin
  
  # Write nginx.conf dynamically on VPS
  cat << 'EOF' > nginx.conf
  upstream frontend_upstream {
      server frontend:80;
  }
  upstream backend_upstream {
      server backend:3001;
  }
  
  server {
      listen 80;
      server_name localhost;
  
      client_max_body_size 10M;
  
      location /api/ {
          proxy_pass http://backend_upstream;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  
      location / {
          proxy_pass http://frontend_upstream;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  
      error_page 500 502 503 504 /50x.html;
      location = /50x.html {
          *** /usr/share/nginx/html;
      }
  }
  EOF
  
  # Write .env dynamically if it doesn't exist
  if [ ! -f .env ]; then
    echo "DB_PASSWORD=sinopiquest_secret" >> .env
    echo "JWT_SECRET=super_secret_jwt_key_that_is_at_least_32_characters_long" >> .env
    echo "GOOGLE_CLIENT_ID=***" >> .env
    echo "GOOGLE_CLIENT_SECRET=***" >> .env
    echo "FRONTEND_URL=https://sirupi.space" >> .env
  fi
  
  # Create or Update docker-compose.yml file dynamically on VPS
  cat << EOF > docker-compose.yml
  services:
    postgres:
      image: postgres:16-alpine
      container_name: sinopiquest_db
      environment:
        POSTGRES_USER: sinopiquest
        POSTGRES_PASSWORD: \${DB_PASSWORD:-sinopiquest_secret}
        POSTGRES_DB: sinopiquest
      volumes:
        - pgdata:/var/lib/postgresql/data
      restart: always
  
    backend:
      image: ghcr.io/${REPO_LOWER}/backend:latest
      container_name: sinopiquest_api
      environment:
        DATABASE_URL: postgresql://sinopiquest:\${DB_PASSWORD:-sinopiquest_secret}@postgres:5432/sinopiquest
        JWT_SECRET: \${JWT_SECRET:-super_secret_jwt_key_that_is_at_least_32_characters_long}
        GOOGLE_CLIENT_ID: \${GOOGLE_CLIENT_ID}
        GOOGLE_CLIENT_SECRET: \${GOOGLE_CLIENT_SECRET}
        FRONTEND_URL: https://sirupi.space
        PORT: 3001
      volumes:
        - uploads_data:/app/uploads
      depends_on:
        postgres:
          condition: service_started
      restart: always
  
    frontend:
      image: ghcr.io/${REPO_LOWER}/frontend:latest
      container_name: sinopiquest_web
      restart: always
  
    nginx:
      image: nginx:stable-alpine
      container_name: sinopiquest_proxy
      ports:
        - "8090:80"
      volumes:
        - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      depends_on:
        - frontend
        - backend
      restart: always
  
  volumes:
    pgdata:
    uploads_data:
  EOF
  
  # Pull the latest images and restart containers
  docker compose pull
  docker compose down
  docker compose up -d
  
  # Run database migrations and seeding dynamically on the backend container
  docker exec sinopiquest_api npx prisma migrate deploy
  docker exec sinopiquest_api npx tsx prisma/seed.ts || true
  
  # Clean up old unused images
  docker image prune -f
  
    timeout: 30s
    command_timeout: 10m
    proxy_port: 22
    proxy_timeout: 30s
/usr/bin/docker run --name dd4e6eda207f7a176241fbaa7fbafae4265b48_d37549 --label dd4e6e --workdir /github/workspace --rm -e "INPUT_HOST" -e "INPUT_USERNAME" -e "INPUT_PASSWORD" -e "INPUT_PORT" -e "INPUT_SCRIPT" -e "INPUT_PASSPHRASE" -e "INPUT_SYNC" -e "INPUT_USE_INSECURE_CIPHER" -e "INPUT_CIPHER" -e "INPUT_TIMEOUT" -e "INPUT_COMMAND_TIMEOUT" -e "INPUT_KEY" -e "INPUT_KEY_PATH" -e "INPUT_FINGERPRINT" -e "INPUT_PROXY_HOST" -e "INPUT_PROXY_PORT" -e "INPUT_PROXY_USERNAME" -e "INPUT_PROXY_PASSWORD" -e "INPUT_PROXY_PASSPHRASE" -e "INPUT_PROXY_TIMEOUT" -e "INPUT_PROXY_KEY" -e "INPUT_PROXY_KEY_PATH" -e "INPUT_PROXY_FINGERPRINT" -e "INPUT_PROXY_CIPHER" -e "INPUT_PROXY_USE_INSECURE_CIPHER" -e "INPUT_SCRIPT_STOP" -e "INPUT_ENVS" -e "INPUT_ENVS_FORMAT" -e "INPUT_DEBUG" -e "INPUT_ALLENVS" -e "INPUT_REQUEST_PTY" -e "HOME" -e "GITHUB_JOB" -e "GITHUB_REF" -e "GITHUB_SHA" -e "GITHUB_REPOSITORY" -e "GITHUB_REPOSITORY_OWNER" -e "GITHUB_REPOSITORY_OWNER_ID" -e "GITHUB_RUN_ID" -e "GITHUB_RUN_NUMBER" -e "GITHUB_RETENTION_DAYS" -e "GITHUB_RUN_ATTEMPT" -e "GITHUB_ACTOR_ID" -e "GITHUB_ACTOR" -e "GITHUB_WORKFLOW" -e "GITHUB_HEAD_REF" -e "GITHUB_BASE_REF" -e "GITHUB_EVENT_NAME" -e "GITHUB_SERVER_URL" -e "GITHUB_API_URL" -e "GITHUB_GRAPHQL_URL" -e "GITHUB_REF_NAME" -e "GITHUB_REF_PROTECTED" -e "GITHUB_REF_TYPE" -e "GITHUB_WORKFLOW_REF" -e "GITHUB_WORKFLOW_SHA" -e "GITHUB_REPOSITORY_ID" -e "GITHUB_TRIGGERING_ACTOR" -e "GITHUB_WORKSPACE" -e "GITHUB_ACTION" -e "GITHUB_EVENT_PATH" -e "GITHUB_ACTION_REPOSITORY" -e "GITHUB_ACTION_REF" -e "GITHUB_PATH" -e "GITHUB_ENV" -e "GITHUB_STEP_SUMMARY" -e "GITHUB_STATE" -e "GITHUB_OUTPUT" -e "RUNNER_OS" -e "RUNNER_ARCH" -e "RUNNER_NAME" -e "RUNNER_ENVIRONMENT" -e "RUNNER_TOOL_CACHE" -e "RUNNER_TEMP" -e "RUNNER_WORKSPACE" -e "ACTIONS_RUNTIME_URL" -e "ACTIONS_RUNTIME_TOKEN" -e "ACTIONS_CACHE_URL" -e "ACTIONS_RESULTS_URL" -e "ACTIONS_ORCHESTRATION_ID" -e GITHUB_ACTIONS=true -e CI=true -v "/var/run/docker.sock":"/var/run/docker.sock" -v "/home/runner/work/_temp":"/github/runner_temp" -v "/home/runner/work/_temp/_github_home":"/github/home" -v "/home/runner/work/_temp/_github_workflow":"/github/workflow" -v "/home/runner/work/_temp/_runner_file_commands":"/github/file_commands" -v "/home/runner/work/NusaQuest_RPG/NusaQuest_RPG":"/github/workspace" dd4e6e:da207f7a176241fbaa7fbafae4265b48
======CMD======
# Make sure deployment directory exists
mkdir -p ~/sinopiquest-deploy
cd ~/sinopiquest-deploy

# Convert repo name to lowercase for Docker image reference
REPO_LOWER=$(echo "brianwibowo/NusaQuest_RPG" | tr '[:upper:]' '[:lower:]')

# Login to GitHub Container Registry on VPS
echo "***" | docker login ghcr.io -u brianwibowo --password-stdin

# Write nginx.conf dynamically on VPS
cat << 'EOF' > nginx.conf
upstream frontend_upstream {
    server frontend:80;
}
upstream backend_upstream {
    server backend:3001;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://backend_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        *** /usr/share/nginx/html;
    }
}
EOF

# Write .env dynamically if it doesn't exist
if [ ! -f .env ]; then
  echo "DB_PASSWORD=sinopiquest_secret" >> .env
  echo "JWT_SECRET=super_secret_jwt_key_that_is_at_least_32_characters_long" >> .env
  echo "GOOGLE_CLIENT_ID=***" >> .env
  echo "GOOGLE_CLIENT_SECRET=***" >> .env
  echo "FRONTEND_URL=https://sirupi.space" >> .env
fi

# Create or Update docker-compose.yml file dynamically on VPS
cat << EOF > docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: sinopiquest_db
    environment:
      POSTGRES_USER: sinopiquest
      POSTGRES_PASSWORD: \${DB_PASSWORD:-sinopiquest_secret}
      POSTGRES_DB: sinopiquest
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  backend:
    image: ghcr.io/${REPO_LOWER}/backend:latest
    container_name: sinopiquest_api
    environment:
      DATABASE_URL: postgresql://sinopiquest:\${DB_PASSWORD:-sinopiquest_secret}@postgres:5432/sinopiquest
      JWT_SECRET: \${JWT_SECRET:-super_secret_jwt_key_that_is_at_least_32_characters_long}
      GOOGLE_CLIENT_ID: \${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: \${GOOGLE_CLIENT_SECRET}
      FRONTEND_URL: https://sirupi.space
      PORT: 3001
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      postgres:
        condition: service_started
    restart: always

  frontend:
    image: ghcr.io/${REPO_LOWER}/frontend:latest
    container_name: sinopiquest_web
    restart: always

  nginx:
    image: nginx:stable-alpine
    container_name: sinopiquest_proxy
    ports:
      - "8090:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  pgdata:
  uploads_data:
EOF

# Pull the latest images and restart containers
docker compose pull
docker compose down
docker compose up -d

# Run database migrations and seeding dynamically on the backend container
docker exec sinopiquest_api npx prisma migrate deploy
docker exec sinopiquest_api npx tsx prisma/seed.ts || true

# Clean up old unused images
docker image prune -f

======END======
err: WARNING! Your password will be stored unencrypted in /***/.docker/config.json.
err: Configure a credential helper to remove this warning. See
err: https://docs.docker.com/engine/reference/commandline/login/#credentials-store
out: Login Succeeded
err:  postgres Pulling 
err:  backend Pulling 
err:  frontend Pulling 
err:  nginx Pulling 
err:  6a0ac1617861 Already exists 
err:  4feea04c1543 Already exists 
err:  b2cbbfe903b0 Already exists 
err:  fff4e2c1b189 Already exists 
err:  e1f9e1581ca1 Already exists 
err:  5825c01fff83 Pulling fs layer 
err:  45185d14efc1 Pulling fs layer 
err:  26872db816d4 Pulling fs layer 
err:  bc9288065dcb Pulling fs layer 
err:  f052f5268965 Pulling fs layer 
err:  630fa1db8b3d Pulling fs layer 
err:  f052f5268965 Waiting 
err:  630fa1db8b3d Waiting 
err:  bc9288065dcb Waiting 
err:  e6f31ffc071e Already exists 
err:  1deb20213977 Already exists 
err:  c79d40162f28 Already exists 
err:  7d9cfad643ec Already exists 
err:  278fa14e43da Already exists 
err:  b264ebfe1e42 Already exists 
err:  440503bb46ca Already exists 
err:  f72ca0003135 Already exists 
err:  f3673bd335b9 Pulling fs layer 
err:  b02f2716048e Pulling fs layer 
err:  f3673bd335b9 Waiting 
err:  b02f2716048e Waiting 
err:  5825c01fff83 Downloading [=======>                                           ]  1.378kB/9.285kB
err:  5825c01fff83 Downloading [==================================================>]  9.285kB/9.285kB
err:  5825c01fff83 Verifying Checksum 
err:  5825c01fff83 Download complete 
err:  5825c01fff83 Extracting [==================================================>]  9.285kB/9.285kB
err:  5825c01fff83 Extracting [==================================================>]  9.285kB/9.285kB
err:  5825c01fff83 Pull complete 
err:  26872db816d4 Downloading [====>                                              ]  1.378kB/14.74kB
err:  26872db816d4 Downloading [==================================================>]  14.74kB/14.74kB
err:  26872db816d4 Verifying Checksum 
err:  26872db816d4 Download complete 
err:  nginx Pulled 
err:  45185d14efc1 Downloading [>                                                  ]  539.3kB/68.07MB
err:  f052f5268965 Downloading [=========>                                         ]  1.378kB/7.477kB
err:  f052f5268965 Downloading [==================================================>]  7.477kB/7.477kB
err:  f052f5268965 Verifying Checksum 
err:  f052f5268965 Download complete 
err:  45185d14efc1 Downloading [=>                                                 ]  1.621MB/68.07MB
err:  45185d14efc1 Downloading [=>                                                 ]  2.161MB/68.07MB
err:  45185d14efc1 Downloading [=>                                                 ]  2.702MB/68.07MB
err:  45185d14efc1 Downloading [==>                                                ]  3.243MB/68.07MB
err:  45185d14efc1 Downloading [==>                                                ]  3.783MB/68.07MB
err:  630fa1db8b3d Downloading [==================================================>]     115B/115B
err:  630fa1db8b3d Verifying Checksum 
err:  630fa1db8b3d Download complete 
err:  45185d14efc1 Downloading [===>                                               ]  4.324MB/68.07MB
err:  45185d14efc1 Downloading [===>                                               ]  4.865MB/68.07MB
err:  45185d14efc1 Downloading [===>                                               ]  5.405MB/68.07MB
err:  bc9288065dcb Downloading [>                                                  ]  244.4kB/22.94MB
err:  45185d14efc1 Downloading [====>                                              ]  5.937MB/68.07MB
err:  45185d14efc1 Downloading [====>                                              ]  6.466MB/68.07MB
err:  55afa1ecc21d Already exists 
err:  0749aef11dca Pulling fs layer 
err:  2d3064b8615b Pulling fs layer 
err:  ef6ab46d98b2 Pulling fs layer 
err:  689a434e3a86 Pulling fs layer 
err:  2f537278bc74 Pulling fs layer 
err:  4096c457dc0d Pulling fs layer 
err:  c86ab38aa6db Pulling fs layer 
err:  713473b5b92b Pulling fs layer 
err:  7af924000309 Pulling fs layer 
err:  0749aef11dca Waiting 
err:  2d3064b8615b Waiting 
err:  ef6ab46d98b2 Waiting 
err:  689a434e3a86 Waiting 
err:  2f537278bc74 Waiting 
err:  4096c457dc0d Waiting 
err:  c86ab38aa6db Waiting 
err:  713473b5b92b Waiting 
err:  7af924000309 Waiting 
err:  cc7fa208b8a7 Pulling fs layer 
err:  cc7fa208b8a7 Waiting 
err:  bc9288065dcb Downloading [=>                                                 ]  490.2kB/22.94MB
err:  f3673bd335b9 Downloading [==================================================>]     279B/279B
err:  f3673bd335b9 Verifying Checksum 
err:  f3673bd335b9 Download complete 
err:  f3673bd335b9 Extracting [==================================================>]     279B/279B
err:  f3673bd335b9 Extracting [==================================================>]     279B/279B
err:  45185d14efc1 Downloading [=====>                                             ]  7.007MB/68.07MB
err:  f3673bd335b9 Pull complete 
err:  45185d14efc1 Downloading [=====>                                             ]  7.543MB/68.07MB
err:  bc9288065dcb Downloading [==>                                                ]  965.3kB/22.94MB
err:  bc9288065dcb Downloading [===>                                               ]  1.457MB/22.94MB
err:  45185d14efc1 Downloading [======>                                            ]  8.617MB/68.07MB
err:  bc9288065dcb Downloading [====>                                              ]  1.943MB/22.94MB
err:  45185d14efc1 Downloading [=======>                                           ]  9.685MB/68.07MB
err:  bc9288065dcb Downloading [=====>                                             ]  2.427MB/22.94MB
err:  bc9288065dcb Downloading [======>                                            ]  2.906MB/22.94MB
err:  bc9288065dcb Downloading [=======>                                           ]  3.385MB/22.94MB
err:  45185d14efc1 Downloading [=======>                                           ]  10.76MB/68.07MB
err:  b02f2716048e Downloading [>                                                  ]  539.3kB/63.72MB
err:  bc9288065dcb Downloading [========>                                          ]  3.864MB/22.94MB
err:  b02f2716048e Downloading [>                                                  ]   1.08MB/63.72MB
err:  45185d14efc1 Downloading [========>                                          ]  11.84MB/68.07MB
err:  bc9288065dcb Downloading [========>                                          ]   4.11MB/22.94MB
err:  b02f2716048e Downloading [=>                                                 ]  1.621MB/63.72MB
err:  45185d14efc1 Downloading [=========>                                         ]  12.91MB/68.07MB
err:  bc9288065dcb Downloading [==========>                                        ]  4.595MB/22.94MB
err:  b02f2716048e Downloading [==>                                                ]  2.702MB/63.72MB
err:  bc9288065dcb Downloading [===========>                                       ]  5.068MB/22.94MB
err:  45185d14efc1 Downloading [==========>                                        ]  13.99MB/68.07MB
err:  b02f2716048e Downloading [==>                                                ]  3.783MB/63.72MB
err:  bc9288065dcb Downloading [============>                                      ]  5.546MB/22.94MB
err:  b02f2716048e Downloading [===>                                               ]  4.865MB/63.72MB
err:  45185d14efc1 Downloading [==========>                                        ]  14.53MB/68.07MB
err:  bc9288065dcb Downloading [=============>                                     ]  6.038MB/22.94MB
err:  b02f2716048e Downloading [=====>                                             ]  6.487MB/63.72MB
err:  45185d14efc1 Downloading [===========>                                       ]  15.07MB/68.07MB
err:  bc9288065dcb Downloading [==============>                                    ]  6.512MB/22.94MB
err:  b02f2716048e Downloading [======>                                            ]    8.1MB/63.72MB
err:  45185d14efc1 Downloading [===========>                                       ]  16.15MB/68.07MB
err:  bc9288065dcb Downloading [===============>                                   ]  7.243MB/22.94MB
err:  45185d14efc1 Downloading [============>                                      ]  17.24MB/68.07MB
err:  bc9288065dcb Downloading [=================>                                 ]  7.971MB/22.94MB
err:  45185d14efc1 Downloading [=============>                                     ]  18.32MB/68.07MB
err:  bc9288065dcb Downloading [==================>                                ]  8.458MB/22.94MB
err:  bc9288065dcb Downloading [====================>                              ]  9.193MB/22.94MB
err:  45185d14efc1 Downloading [==============>                                    ]   19.4MB/68.07MB
err:  bc9288065dcb Downloading [=====================>                             ]  9.925MB/22.94MB
err:  45185d14efc1 Downloading [===============>                                   ]  20.48MB/68.07MB
err:  45185d14efc1 Downloading [===============>                                   ]  21.02MB/68.07MB
err:  bc9288065dcb Downloading [=======================>                           ]  10.65MB/22.94MB
err:  45185d14efc1 Downloading [================>                                  ]  22.64MB/68.07MB
err:  45185d14efc1 Downloading [=================>                                 ]  24.26MB/68.07MB
err:  bc9288065dcb Downloading [========================>                          ]  11.14MB/22.94MB
err:  45185d14efc1 Downloading [===================>                               ]  25.87MB/68.07MB
err:  bc9288065dcb Downloading [=========================>                         ]  11.63MB/22.94MB
err:  b02f2716048e Downloading [========>                                          ]   10.8MB/63.72MB
err:  45185d14efc1 Downloading [====================>                              ]  27.49MB/68.07MB
err:  bc9288065dcb Downloading [==========================>                        ]  12.36MB/22.94MB
err:  45185d14efc1 Downloading [=====================>                             ]  29.11MB/68.07MB
err:  b02f2716048e Downloading [========>                                          ]  11.34MB/63.72MB
err:  bc9288065dcb Downloading [============================>                      ]  13.09MB/22.94MB
err:  45185d14efc1 Downloading [======================>                            ]  30.74MB/68.07MB
err:  b02f2716048e Downloading [=========>                                         ]  12.41MB/63.72MB
err:  bc9288065dcb Downloading [==============================>                    ]  13.82MB/22.94MB
err:  b02f2716048e Downloading [==========>                                        ]  12.93MB/63.72MB
err:  bc9288065dcb Downloading [===============================>                   ]  14.31MB/22.94MB
err:  b02f2716048e Downloading [===========>                                       ]  15.05MB/63.72MB
err:  45185d14efc1 Downloading [=======================>                           ]  31.82MB/68.07MB
err:  bc9288065dcb Downloading [=================================>                 ]  15.28MB/22.94MB
err:  b02f2716048e Downloading [============>                                      ]  16.12MB/63.72MB
err:  b02f2716048e Downloading [==============>                                    ]  18.81MB/63.72MB
err:  bc9288065dcb Downloading [===================================>               ]  16.25MB/22.94MB
err:  45185d14efc1 Downloading [========================>                          ]   32.9MB/68.07MB
err:  bc9288065dcb Downloading [=====================================>             ]  17.22MB/22.94MB
err:  45185d14efc1 Downloading [========================>                          ]  33.96MB/68.07MB
err:  bc9288065dcb Downloading [=======================================>           ]   18.2MB/22.94MB
err:  45185d14efc1 Downloading [=========================>                         ]  35.05MB/68.07MB
err:  bc9288065dcb Downloading [=========================================>         ]  19.18MB/22.94MB
err:  45185d14efc1 Downloading [==========================>                        ]  36.67MB/68.07MB
err:  b02f2716048e Downloading [================>                                  ]  21.51MB/63.72MB
err:  bc9288065dcb Downloading [===========================================>       ]  20.15MB/22.94MB
err:  b02f2716048e Downloading [==================>                                ]  23.13MB/63.72MB
err:  45185d14efc1 Downloading [===========================>                       ]   37.2MB/68.07MB
err:  b02f2716048e Downloading [===================>                               ]  24.75MB/63.72MB
err:  45185d14efc1 Downloading [============================>                      ]  38.81MB/68.07MB
err:  b02f2716048e Downloading [====================>                              ]  26.36MB/63.72MB
err:  bc9288065dcb Downloading [==============================================>    ]  21.12MB/22.94MB
err:  45185d14efc1 Downloading [=============================>                     ]  40.42MB/68.07MB
err:  b02f2716048e Downloading [=====================>                             ]  27.98MB/63.72MB
err:  bc9288065dcb Downloading [===============================================>   ]  21.85MB/22.94MB
err:  b02f2716048e Downloading [=======================>                           ]  29.61MB/63.72MB
err:  45185d14efc1 Downloading [==============================>                    ]   41.5MB/68.07MB
err:  bc9288065dcb Downloading [================================================>  ]  22.35MB/22.94MB
err:  b02f2716048e Downloading [========================>                          ]  31.23MB/63.72MB
err:  bc9288065dcb Verifying Checksum 
err:  bc9288065dcb Download complete 
err:  45185d14efc1 Downloading [==============================>                    ]  42.02MB/68.07MB
err:  b02f2716048e Downloading [========================>                          ]  31.77MB/63.72MB
err:  45185d14efc1 Downloading [================================>                  ]  43.65MB/68.07MB
err:  b02f2716048e Downloading [==========================>                        ]  33.93MB/63.72MB
err:  45185d14efc1 Downloading [=================================>                 ]  45.27MB/68.07MB
err:  45185d14efc1 Downloading [=================================>                 ]  45.81MB/68.07MB
err:  b02f2716048e Downloading [===========================>                       ]  34.46MB/63.72MB
err:  45185d14efc1 Downloading [==================================>                ]  47.42MB/68.07MB
err:  b02f2716048e Downloading [=============================>                     ]  37.16MB/63.72MB
err:  45185d14efc1 Downloading [====================================>              ]  49.58MB/68.07MB
err:  b02f2716048e Downloading [==============================>                    ]  38.24MB/63.72MB
err:  0749aef11dca Downloading [==================================================>]     970B/970B
err:  0749aef11dca Verifying Checksum 
err:  0749aef11dca Download complete 
err:  0749aef11dca Extracting [==================================================>]     970B/970B
err:  0749aef11dca Extracting [==================================================>]     970B/970B
err:  0749aef11dca Pull complete 
err:  b02f2716048e Downloading [===============================>                   ]   40.4MB/63.72MB
err:  45185d14efc1 Downloading [=====================================>             ]   51.2MB/68.07MB
err:  b02f2716048e Downloading [================================>                  ]  41.48MB/63.72MB
err:  45185d14efc1 Downloading [======================================>            ]   52.8MB/68.07MB
err:  b02f2716048e Downloading [================================>                  ]  42.02MB/63.72MB
err:  45185d14efc1 Downloading [========================================>          ]  54.95MB/68.07MB
err:  b02f2716048e Downloading [===================================>               ]  44.73MB/63.72MB
err:  45185d14efc1 Downloading [=========================================>         ]  56.57MB/68.07MB
err:  b02f2716048e Downloading [===================================>               ]  45.79MB/63.72MB
err:  2d3064b8615b Downloading [>                                                  ]  15.79kB/900.3kB
err:  45185d14efc1 Downloading [===========================================>       ]  58.74MB/68.07MB
err:  b02f2716048e Downloading [====================================>              ]  46.86MB/63.72MB
err:  2d3064b8615b Downloading [==================================================>]  900.3kB/900.3kB
err:  2d3064b8615b Verifying Checksum 
err:  2d3064b8615b Download complete 
err:  2d3064b8615b Extracting [=>                                                 ]  32.77kB/900.3kB
err:  2d3064b8615b Extracting [==================================================>]  900.3kB/900.3kB
err:  2d3064b8615b Extracting [==================================================>]  900.3kB/900.3kB
err:  2d3064b8615b Pull complete 
err:  45185d14efc1 Downloading [============================================>      ]  60.36MB/68.07MB
err:  b02f2716048e Downloading [======================================>            ]  48.48MB/63.72MB
err:  45185d14efc1 Downloading [=============================================>     ]  61.98MB/68.07MB
err:  b02f2716048e Downloading [=======================================>           ]  50.64MB/63.72MB
err:  b02f2716048e Downloading [=========================================>         ]  52.26MB/63.72MB
err:  45185d14efc1 Downloading [==============================================>    ]  63.04MB/68.07MB
err:  b02f2716048e Downloading [=========================================>         ]   52.8MB/63.72MB
err:  45185d14efc1 Downloading [===============================================>   ]  64.67MB/68.07MB
err:  b02f2716048e Downloading [==========================================>        ]  54.43MB/63.72MB
err:  45185d14efc1 Downloading [================================================>  ]  66.29MB/68.07MB
err:  b02f2716048e Downloading [===========================================>       ]  55.51MB/63.72MB
err:  45185d14efc1 Downloading [=================================================> ]  67.91MB/68.07MB
err:  45185d14efc1 Verifying Checksum 
err:  45185d14efc1 Download complete 
err:  45185d14efc1 Extracting [>                                                  ]  557.1kB/68.07MB
err:  b02f2716048e Downloading [=============================================>     ]  57.66MB/63.72MB
err:  ef6ab46d98b2 Downloading [==================================================>]     173B/173B
err:  ef6ab46d98b2 Verifying Checksum 
err:  ef6ab46d98b2 Download complete 
err:  ef6ab46d98b2 Extracting [==================================================>]     173B/173B
err:  ef6ab46d98b2 Extracting [==================================================>]     173B/173B
err:  45185d14efc1 Extracting [==>                                                ]  2.785MB/68.07MB
err:  ef6ab46d98b2 Pull complete 
err:  b02f2716048e Downloading [==============================================>    ]  58.74MB/63.72MB
err:  45185d14efc1 Extracting [====>                                              ]  5.571MB/68.07MB
err:  b02f2716048e Downloading [===============================================>   ]   60.9MB/63.72MB
err:  45185d14efc1 Extracting [======>                                            ]  8.356MB/68.07MB
err:  45185d14efc1 Extracting [=========>                                         ]  12.81MB/68.07MB
err:  45185d14efc1 Extracting [============>                                      ]  17.27MB/68.07MB
err:  b02f2716048e Downloading [=================================================> ]  63.04MB/63.72MB
err:  b02f2716048e Verifying Checksum 
err:  b02f2716048e Download complete 
err:  45185d14efc1 Extracting [==============>                                    ]  20.05MB/68.07MB
err:  b02f2716048e Extracting [>                                                  ]  557.1kB/63.72MB
err:  689a434e3a86 Downloading [==================================================>]     116B/116B
err:  689a434e3a86 Verifying Checksum 
err:  689a434e3a86 Download complete 
err:  689a434e3a86 Extracting [==================================================>]     116B/116B
err:  689a434e3a86 Extracting [==================================================>]     116B/116B
err:  45185d14efc1 Extracting [================>                                  ]  22.84MB/68.07MB
err:  689a434e3a86 Pull complete 
err:  b02f2716048e Extracting [===>                                               ]  3.899MB/63.72MB
err:  b02f2716048e Extracting [======>                                            ]  8.356MB/63.72MB
err:  45185d14efc1 Extracting [==================>                                ]  24.51MB/68.07MB
err:  2f537278bc74 Downloading [>                                                  ]  538.9kB/111.3MB
err:  b02f2716048e Extracting [=========>                                         ]  12.26MB/63.72MB
err:  2f537278bc74 Downloading [=>                                                 ]  3.221MB/111.3MB
err:  2f537278bc74 Downloading [===>                                               ]  8.545MB/111.3MB
err:  b02f2716048e Extracting [==========>                                        ]  13.93MB/63.72MB
err:  2f537278bc74 Downloading [======>                                            ]  15.47MB/111.3MB
err:  2f537278bc74 Downloading [========>                                          ]  19.74MB/111.3MB
err:  b02f2716048e Extracting [============>                                      ]   15.6MB/63.72MB
err:  2f537278bc74 Downloading [===========>                                       ]  26.63MB/111.3MB
err:  4096c457dc0d Downloading [==================>                                ]  3.503kB/9.62kB
err:  4096c457dc0d Downloading [==================================================>]   9.62kB/9.62kB
err:  4096c457dc0d Verifying Checksum 
err:  4096c457dc0d Download complete 
err:  45185d14efc1 Extracting [==================>                                ]  25.07MB/68.07MB
err:  2f537278bc74 Downloading [==============>                                    ]  31.95MB/111.3MB
err:  c86ab38aa6db Downloading [==================================================>]     128B/128B
err:  c86ab38aa6db Verifying Checksum 
err:  c86ab38aa6db Download complete 
err:  b02f2716048e Extracting [==============>                                    ]  18.38MB/63.72MB
err:  2f537278bc74 Downloading [================>                                  ]  36.73MB/111.3MB
err:  b02f2716048e Extracting [===============>                                   ]  20.05MB/63.72MB
err:  2f537278bc74 Downloading [===================>                               ]  43.67MB/111.3MB
err:  b02f2716048e Extracting [================>                                  ]  20.61MB/63.72MB
err:  2f537278bc74 Downloading [======================>                            ]  49.48MB/111.3MB
err:  b02f2716048e Extracting [=================>                                 ]  21.73MB/63.72MB
err:  45185d14efc1 Extracting [==================>                                ]  25.62MB/68.07MB
err:  2f537278bc74 Downloading [=========================>                         ]  55.87MB/111.3MB
err:  b02f2716048e Extracting [=================>                                 ]  22.84MB/63.72MB
err:  2f537278bc74 Downloading [===========================>                       ]  61.18MB/111.3MB
err:  45185d14efc1 Extracting [===================>                               ]  26.74MB/68.07MB
err:  b02f2716048e Extracting [===================>                               ]  25.07MB/63.72MB
err:  2f537278bc74 Downloading [=============================>                     ]  66.47MB/111.3MB
err:  45185d14efc1 Extracting [====================>                              ]  28.41MB/68.07MB
err:  2f537278bc74 Downloading [================================>                  ]  72.82MB/111.3MB
err:  b02f2716048e Extracting [=====================>                             ]  27.85MB/63.72MB
err:  713473b5b92b Downloading [==================================================>]     167B/167B
err:  713473b5b92b Verifying Checksum 
err:  713473b5b92b Download complete 
err:  2f537278bc74 Downloading [===================================>               ]  78.66MB/111.3MB
err:  b02f2716048e Extracting [======================>                            ]  28.41MB/63.72MB
err:  7af924000309 Downloading [============================>                      ]  3.503kB/6.109kB
err:  7af924000309 Downloading [==================================================>]  6.109kB/6.109kB
err:  7af924000309 Verifying Checksum 
err:  7af924000309 Download complete 
err:  2f537278bc74 Downloading [======================================>            ]  85.58MB/111.3MB
err:  45185d14efc1 Extracting [=====================>                             ]  29.52MB/68.07MB
err:  b02f2716048e Extracting [========================>                          ]  30.64MB/63.72MB
err:  2f537278bc74 Downloading [========================================>          ]  89.84MB/111.3MB
err:  45185d14efc1 Extracting [======================>                            ]  30.08MB/68.07MB
err:  b02f2716048e Extracting [========================>                          ]  31.75MB/63.72MB
err:  2f537278bc74 Downloading [==========================================>        ]  93.54MB/111.3MB
err:  2f537278bc74 Downloading [============================================>      ]  98.34MB/111.3MB
err:  45185d14efc1 Extracting [======================>                            ]   31.2MB/68.07MB
err:  b02f2716048e Extracting [=========================>                         ]  32.87MB/63.72MB
err:  2f537278bc74 Downloading [===============================================>   ]  104.7MB/111.3MB
err:  45185d14efc1 Extracting [=======================>                           ]  31.75MB/68.07MB
err:  b02f2716048e Extracting [==========================>                        ]  33.98MB/63.72MB
err:  2f537278bc74 Verifying Checksum 
err:  2f537278bc74 Download complete 
err:  45185d14efc1 Extracting [========================>                          ]  32.87MB/68.07MB
err:  b02f2716048e Extracting [=============================>                     ]  37.88MB/63.72MB
err:  cc7fa208b8a7 Downloading [==================================================>]     184B/184B
err:  cc7fa208b8a7 Verifying Checksum 
err:  cc7fa208b8a7 Download complete 
err:  2f537278bc74 Extracting [>                                                  ]  557.1kB/111.3MB
err:  45185d14efc1 Extracting [========================>                          ]  33.98MB/68.07MB
err:  b02f2716048e Extracting [===============================>                   ]  40.67MB/63.72MB
err:  2f537278bc74 Extracting [>                                                  ]  1.671MB/111.3MB
err:  b02f2716048e Extracting [=================================>                 ]  42.34MB/63.72MB
err:  45185d14efc1 Extracting [=========================>                         ]  35.09MB/68.07MB
err:  45185d14efc1 Extracting [===========================>                       ]  36.77MB/68.07MB
err:  2f537278bc74 Extracting [=>                                                 ]  2.785MB/111.3MB
err:  b02f2716048e Extracting [==================================>                ]  44.56MB/63.72MB
err:  2f537278bc74 Extracting [==>                                                ]  4.456MB/111.3MB
err:  b02f2716048e Extracting [====================================>              ]  46.79MB/63.72MB
err:  45185d14efc1 Extracting [============================>                      ]  38.99MB/68.07MB
err:  2f537278bc74 Extracting [==>                                                ]  6.128MB/111.3MB
err:  45185d14efc1 Extracting [==============================>                    ]  41.22MB/68.07MB
err:  b02f2716048e Extracting [======================================>            ]  49.58MB/63.72MB
err:  2f537278bc74 Extracting [===>                                               ]  7.799MB/111.3MB
err:  45185d14efc1 Extracting [===============================>                   ]  42.34MB/68.07MB
err:  b02f2716048e Extracting [========================================>          ]  51.81MB/63.72MB
err:  2f537278bc74 Extracting [====>                                              ]  10.03MB/111.3MB
err:  45185d14efc1 Extracting [================================>                  ]  44.56MB/68.07MB
err:  b02f2716048e Extracting [==========================================>        ]  54.59MB/63.72MB
err:  2f537278bc74 Extracting [=====>                                             ]  12.26MB/111.3MB
err:  45185d14efc1 Extracting [=================================>                 ]  46.24MB/68.07MB
err:  b02f2716048e Extracting [============================================>      ]  56.82MB/63.72MB
err:  2f537278bc74 Extracting [======>                                            ]  14.48MB/111.3MB
err:  45185d14efc1 Extracting [===================================>               ]  48.46MB/68.07MB
err:  b02f2716048e Extracting [==============================================>    ]  59.05MB/63.72MB
err:  2f537278bc74 Extracting [=======>                                           ]  16.15MB/111.3MB
err:  45185d14efc1 Extracting [====================================>              ]  50.14MB/68.07MB
err:  b02f2716048e Extracting [================================================>  ]  61.83MB/63.72MB
err:  2f537278bc74 Extracting [========>                                          ]  18.38MB/111.3MB
err:  b02f2716048e Extracting [==================================================>]  63.72MB/63.72MB
err:  45185d14efc1 Extracting [=======================================>           ]  53.48MB/68.07MB
err:  2f537278bc74 Extracting [=========>                                         ]  21.17MB/111.3MB
err:  2f537278bc74 Extracting [============>                                      ]   27.3MB/111.3MB
err:  45185d14efc1 Extracting [=======================================>           ]  54.03MB/68.07MB
err:  2f537278bc74 Extracting [=============>                                     ]  28.97MB/111.3MB
err:  45185d14efc1 Extracting [=========================================>         ]  56.26MB/68.07MB
err:  2f537278bc74 Extracting [==============>                                    ]   31.2MB/111.3MB
err:  b02f2716048e Pull complete 
err:  45185d14efc1 Extracting [===========================================>       ]  59.05MB/68.07MB
err:  frontend Pulled 
err:  2f537278bc74 Extracting [===============>                                   ]  33.42MB/111.3MB
err:  45185d14efc1 Extracting [=============================================>     ]  61.83MB/68.07MB
err:  2f537278bc74 Extracting [===============>                                   ]  35.09MB/111.3MB
err:  45185d14efc1 Extracting [===============================================>   ]  65.18MB/68.07MB
err:  45185d14efc1 Extracting [==================================================>]  68.07MB/68.07MB
err:  2f537278bc74 Extracting [=================>                                 ]  38.44MB/111.3MB
err:  45185d14efc1 Pull complete 
err:  26872db816d4 Extracting [==================================================>]  14.74kB/14.74kB
err:  26872db816d4 Extracting [==================================================>]  14.74kB/14.74kB
err:  26872db816d4 Pull complete 
err:  2f537278bc74 Extracting [==================>                                ]  41.22MB/111.3MB
err:  bc9288065dcb Extracting [>                                                  ]  262.1kB/22.94MB
err:  2f537278bc74 Extracting [===================>                               ]  44.01MB/111.3MB
err:  bc9288065dcb Extracting [======>                                            ]  2.884MB/22.94MB
err:  2f537278bc74 Extracting [====================>                              ]  46.24MB/111.3MB
err:  bc9288065dcb Extracting [===========>                                       ]  5.505MB/22.94MB
err:  2f537278bc74 Extracting [======================>                            ]  49.02MB/111.3MB
err:  bc9288065dcb Extracting [==================>                                ]  8.389MB/22.94MB
err:  2f537278bc74 Extracting [=======================>                           ]  51.25MB/111.3MB
err:  bc9288065dcb Extracting [=======================>                           ]  11.01MB/22.94MB
err:  2f537278bc74 Extracting [========================>                          ]  53.48MB/111.3MB
err:  bc9288065dcb Extracting [=============================>                     ]  13.37MB/22.94MB
err:  2f537278bc74 Extracting [========================>                          ]  55.15MB/111.3MB
err:  bc9288065dcb Extracting [==================================>                ]  15.73MB/22.94MB
err:  bc9288065dcb Extracting [======================================>            ]  17.83MB/22.94MB
err:  2f537278bc74 Extracting [=========================>                         ]  56.26MB/111.3MB
err:  bc9288065dcb Extracting [==========================================>        ]  19.66MB/22.94MB
err:  2f537278bc74 Extracting [==========================>                        ]  57.93MB/111.3MB
err:  bc9288065dcb Extracting [=================================================> ]  22.54MB/22.94MB
err:  bc9288065dcb Extracting [==================================================>]  22.94MB/22.94MB
err:  bc9288065dcb Pull complete 
err:  f052f5268965 Extracting [==================================================>]  7.477kB/7.477kB
err:  f052f5268965 Extracting [==================================================>]  7.477kB/7.477kB
err:  2f537278bc74 Extracting [==========================>                        ]   59.6MB/111.3MB
err:  2f537278bc74 Extracting [===========================>                       ]  61.83MB/111.3MB
err:  f052f5268965 Pull complete 
err:  630fa1db8b3d Extracting [==================================================>]     115B/115B
err:  630fa1db8b3d Extracting [==================================================>]     115B/115B
err:  630fa1db8b3d Pull complete 
err:  backend Pulled 
err:  2f537278bc74 Extracting [=============================>                     ]  64.62MB/111.3MB
err:  2f537278bc74 Extracting [==============================>                    ]  67.96MB/111.3MB
err:  2f537278bc74 Extracting [================================>                  ]  71.86MB/111.3MB
err:  2f537278bc74 Extracting [==================================>                ]  75.76MB/111.3MB
err:  2f537278bc74 Extracting [====================================>              ]  80.22MB/111.3MB
err:  2f537278bc74 Extracting [====================================>              ]  81.33MB/111.3MB
err:  2f537278bc74 Extracting [=====================================>             ]  82.44MB/111.3MB
err:  2f537278bc74 Extracting [=====================================>             ]  84.12MB/111.3MB
err:  2f537278bc74 Extracting [======================================>            ]  86.34MB/111.3MB
err:  2f537278bc74 Extracting [=======================================>           ]  88.57MB/111.3MB
err:  2f537278bc74 Extracting [========================================>          ]   90.8MB/111.3MB
err:  2f537278bc74 Extracting [=========================================>         ]  93.03MB/111.3MB
err:  2f537278bc74 Extracting [===========================================>       ]  96.37MB/111.3MB
err:  2f537278bc74 Extracting [============================================>      ]  98.04MB/111.3MB
err:  2f537278bc74 Extracting [==============================================>    ]  102.5MB/111.3MB
err:  2f537278bc74 Extracting [================================================>  ]  107.5MB/111.3MB
err:  2f537278bc74 Extracting [==================================================>]  111.3MB/111.3MB
err:  2f537278bc74 Pull complete 
err:  4096c457dc0d Extracting [==================================================>]   9.62kB/9.62kB
err:  4096c457dc0d Extracting [==================================================>]   9.62kB/9.62kB
err:  4096c457dc0d Pull complete 
err:  c86ab38aa6db Extracting [==================================================>]     128B/128B
err:  c86ab38aa6db Extracting [==================================================>]     128B/128B
err:  c86ab38aa6db Pull complete 
err:  713473b5b92b Extracting [==================================================>]     167B/167B
err:  713473b5b92b Extracting [==================================================>]     167B/167B
err:  713473b5b92b Pull complete 
err:  7af924000309 Extracting [==================================================>]  6.109kB/6.109kB
err:  7af924000309 Extracting [==================================================>]  6.109kB/6.109kB
err:  7af924000309 Pull complete 
err:  cc7fa208b8a7 Extracting [==================================================>]     184B/184B
err:  cc7fa208b8a7 Extracting [==================================================>]     184B/184B
err:  cc7fa208b8a7 Pull complete 
err:  postgres Pulled 
err:  Network sinopiquest-deploy_default  Creating
err:  Network sinopiquest-deploy_default  Created
err:  Volume "sinopiquest-deploy_pgdata"  Creating
err:  Volume "sinopiquest-deploy_pgdata"  Created
err:  Volume "sinopiquest-deploy_uploads_data"  Creating
err:  Volume "sinopiquest-deploy_uploads_data"  Created
err:  Container sinopiquest_web  Creating
err:  Container sinopiquest_db  Creating
err:  Container sinopiquest_db  Created
err:  Container sinopiquest_api  Creating
err:  Container sinopiquest_web  Created
err:  Container sinopiquest_api  Created
err:  Container sinopiquest_proxy  Creating
err:  Container sinopiquest_proxy  Created
err:  Container sinopiquest_web  Starting
err:  Container sinopiquest_db  Starting
err:  Container sinopiquest_web  Started
err:  Container sinopiquest_db  Started
err:  Container sinopiquest_api  Starting
err:  Container sinopiquest_api  Started
err:  Container sinopiquest_proxy  Starting
err: Error response from daemon: driver failed programming external connectivity on endpoint sinopiquest_proxy (96734f8119a1be78687fae5c8a72706e5496da49d673664f518a981a7cd9b929): Bind for 0.0.0.0:8090 failed: port is already allocated
err: prisma:warn Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-1.1.x".
err: Please manually install OpenSSL and try installing Prisma again.
err: Error response from daemon: Container dccf1fb77e1fa849b5089e0fa30b9bf5efa8fd2b5ab7866471543ff454eeba45 is restarting, wait until the container is running
out: Deleted Images:
out: deleted: sha256:2384d4a2a213569838d7197c13c26eff7b10ce9478d33ce6d69d486912442768
out: Total reclaimed space: 0B
==============================================
✅ Successfully executed commands to all host.
==============================================