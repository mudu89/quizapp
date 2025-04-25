# Use the official PostgreSQL image as the base
FROM postgres:13.6

# Set the working directory
WORKDIR /docker-entrypoint-initdb.d

# Copy the SQL files and the initialization script into the container
# COPY sql/ ./sql/
# COPY execute_sql_scripts.sh ./execute_sql_scripts.sh

# # Make the script executable
# RUN chmod +x ./execute_sql_scripts.sh

# Copy all SQL files to the initialization directory
COPY sql/*.sql /docker-entrypoint-initdb.d/

# Use the default PostgreSQL entrypoint