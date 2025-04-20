# Use the official Parity ink! container image with all tools pre-configured
FROM paritytech/ink-ci-linux:production

# Set work directory
WORKDIR /contract

# Copy only the files needed for dependency calculation first (for better caching)
COPY Cargo.toml Cargo.lock ./

# Create a dummy lib.rs to build dependencies
RUN mkdir -p src && \
    echo "// Dummy file for initial dependency build" > lib.rs && \
    # Build dependencies only (will be cached)
    cargo contract build --release || true && \
    # Clean up the dummy file
    rm lib.rs

# Now copy the actual source code
COPY . .

# Build the actual contract with optimizations
RUN cargo contract build --release

# The output files will be in /contract/target/ink/becoming.wasm and /contract/target/ink/becoming.json 