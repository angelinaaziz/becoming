#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(unexpected_cfgs)]
#![allow(clippy::cast_possible_truncation)]
#![allow(clippy::arithmetic_side_effects)]

//! # Becoming Contract
//!
//! A soul-bound NFT that evolves as users achieve personal milestones
//!
//! ## Overview
//!
//! The Becoming contract allows users to:
//! - Mint a soul-bound NFT (non-transferable)
//! - Add verifiable milestones with proof hashes
//! - Receive tips from supporters
//!
//! As milestones are added, the associated avatar evolves through stages.

#[ink::contract]
mod becoming {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;

    /// Structure to store milestone data
    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Milestone {
        /// Title of the milestone
        title: String,
        /// Proof hash (SHA-256 in hex format)
        proof_hash: String,
        /// Optional description
        description: Option<String>,
        /// Category of the milestone (e.g., "education", "career", "personal")
        category: Option<String>,
        /// Timestamp when the milestone was added
        timestamp: u64,
    }

    /// Errors that can occur during contract execution
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum ContractError {
        /// NFT has already been minted
        AlreadyMinted,
        /// Only the owner can perform this action
        NotOwner,
        /// Transfer is not allowed (soul-bound NFT)
        TransferNotAllowed,
        /// Payment transfer failed
        PaymentFailed,
        /// Invalid proof hash format
        InvalidProofHash,
        /// Only the contract admin can perform this action
        NotAdmin,
    }

    /// The Becoming contract storage
    #[ink(storage)]
    pub struct Becoming {
        /// The owner of the NFT (None if not minted yet)
        owner: Option<AccountId>,
        /// List of milestones
        milestones: Vec<Milestone>,
        /// Contract admin (for upgrades)
        admin: AccountId,
    }

    impl Default for Becoming {
        fn default() -> Self {
            Self {
                owner: None,
                milestones: Vec::new(),
                admin: AccountId::from([0; 32]), // Use zero address as default
            }
        }
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct Minted {
        #[ink(topic)]
        owner: AccountId,
    }

    #[ink(event)]
    pub struct MilestoneAdded {
        #[ink(topic)]
        owner: AccountId,
        milestone_id: u32,
        title: String,
        category: Option<String>,
    }

    #[ink(event)]
    pub struct TipSent {
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        amount: Balance,
    }

    impl Becoming {
        /// Creates a new Becoming contract
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            Self {
                owner: None,
                milestones: Vec::new(),
                admin: caller,
            }
        }

        /// Creates a new Becoming contract with a specified admin
        #[ink(constructor)]
        pub fn new_with_admin(admin: AccountId) -> Self {
            Self {
                owner: None,
                milestones: Vec::new(),
                admin,
            }
        }

        /// Exports contract data for migration to a new version
        /// Can only be called by the admin
        #[ink(message)]
        pub fn export_data(&self) -> Result<(Option<AccountId>, Vec<(String, String)>), ContractError> {
            let caller = self.env().caller();
            if caller != self.admin {
                return Err(ContractError::NotAdmin);
            }
            
            // For simplicity, we just return the token's milestones as (title, proof_hash) pairs
            let milestones_export: Vec<(String, String)> = self.milestones
                .iter()
                .map(|m| (m.title.clone(), m.proof_hash.clone()))
                .collect();
                
            Ok((self.owner, milestones_export))
        }

        /// Updates the admin address
        /// Can only be called by the current admin
        #[ink(message)]
        pub fn update_admin(&mut self, new_admin: AccountId) -> Result<(), ContractError> {
            let caller = self.env().caller();
            if caller != self.admin {
                return Err(ContractError::NotAdmin);
            }

            self.admin = new_admin;
            Ok(())
        }

        /// Mints a soul-bound NFT to the caller
        /// This can only be called once and establishes the owner
        #[ink(message)]
        pub fn mint(&mut self) -> Result<(), ContractError> {
            // Ensure NFT hasn't already been minted
            if self.owner.is_some() {
                return Err(ContractError::AlreadyMinted);
            }

            // Set the caller as the owner
            let caller = self.env().caller();
            self.owner = Some(caller);

            // Emit an event for the minting
            self.env().emit_event(Minted { owner: caller });

            Ok(())
        }

        /// Adds a milestone with title and proof hash
        /// Returns the total milestone count
        #[ink(message)]
        pub fn add_milestone(
            &mut self,
            title: String,
            proof_hash: String,
            description: Option<String>,
            category: Option<String>,
        ) -> Result<u32, ContractError> {
            // Ensure caller is the owner
            let caller = self.env().caller();
            match self.owner {
                Some(owner) if owner == caller => {}
                _ => return Err(ContractError::NotOwner),
            }

            // Basic validation of the proof hash
            if !validate_proof_hash(&proof_hash) {
                return Err(ContractError::InvalidProofHash);
            }

            // Add the milestone
            let milestone = Milestone {
                title: title.clone(),
                proof_hash,
                description,
                category: category.clone(),
                timestamp: self.env().block_timestamp(),
            };
            self.milestones.push(milestone);

            // Get the new milestone ID (index)
            let milestone_id = self.milestones.len() as u32 - 1;

            // Emit an event for the milestone addition
            self.env().emit_event(MilestoneAdded {
                owner: caller,
                milestone_id,
                title,
                category,
            });

            Ok(milestone_id)
        }

        /// Sends a tip in native DOT to the recipient
        #[ink(message, payable)]
        pub fn tip(&mut self, recipient: AccountId) -> Result<(), ContractError> {
            // Get the transferred value
            let value = self.env().transferred_value();
            let caller = self.env().caller();

            // Transfer the amount to the recipient
            if self.env().transfer(recipient, value).is_err() {
                return Err(ContractError::PaymentFailed);
            }

            // Emit an event for the tip
            self.env().emit_event(TipSent {
                from: caller,
                to: recipient,
                amount: value,
            });

            Ok(())
        }

        /// Returns the current avatar stage based on milestones count
        /// Stage 0: 0 milestones (Grayscale)
        /// Stage 1: 1 milestone (Color)
        /// Stage 2: 2 milestones (Vivid)
        /// Stage 3: 3+ milestones (Halo)
        #[ink(message)]
        pub fn get_avatar_stage(&self) -> u8 {
            let milestone_count = self.milestones.len() as u8;
            match milestone_count {
                0 => 0, // Stage 0: GRAYSCALE
                1 => 1, // Stage 1: COLOR
                2 => 2, // Stage 2: VIVID
                _ => 3, // Stage 3: HALO (3+ milestones)
            }
        }

        /// Returns all milestones
        #[ink(message)]
        pub fn get_milestones(&self) -> Vec<Milestone> {
            self.milestones.clone()
        }

        /// Returns the owner of the soul-bound NFT
        #[ink(message)]
        pub fn get_owner(&self) -> Option<AccountId> {
            self.owner
        }

        /// Explicitly prevents the transfer of this soul-bound NFT
        /// Always returns TransferNotAllowed error
        #[ink(message)]
        pub fn transfer(&self, _to: AccountId) -> Result<(), ContractError> {
            Err(ContractError::TransferNotAllowed)
        }
    }

    /// Helper function to check if a string only contains hex characters
    fn is_valid_hex(s: &str) -> bool {
        s.chars().all(|c| c.is_ascii_hexdigit())
    }

    /// Helper function to validate a proof hash
    /// Proof hash must be:
    /// 1. Exactly 64 characters (SHA-256 hash)
    /// 2. Contain only hex characters
    /// 3. Start with the prefix "0x" (optional)
    fn validate_proof_hash(hash: &str) -> bool {
        // Remove 0x prefix if present
        let hash = if hash.starts_with("0x") {
            &hash[2..]
        } else {
            hash
        };

        // Check length and hex format
        hash.len() == 64 && is_valid_hex(hash)
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{account_id, DefaultEnvironment};

        // Helper function to create and mint a contract
        fn create_minted_contract() -> Becoming {
            let mut contract = Becoming::new();
            assert_eq!(contract.mint(), Ok(()));
            contract
        }

        #[ink::test]
        fn test_mint_once() {
            // Create contract
            let mut contract = Becoming::new();

            // Initially no owner
            assert_eq!(contract.get_owner(), None);

            // Mint for the first time
            assert_eq!(contract.mint(), Ok(()));

            // Now there should be an owner
            assert_eq!(
                contract.get_owner(),
                Some(account_id::<DefaultEnvironment>())
            );

            // Try to mint again - should fail
            assert_eq!(contract.mint(), Err(ContractError::AlreadyMinted));
        }

        #[ink::test]
        fn test_add_milestone() {
            // Create contract and mint
            let mut contract = create_minted_contract();

            // Check initial state
            assert_eq!(contract.get_milestones().len(), 0);
            assert_eq!(contract.get_avatar_stage(), 0);

            // Add a milestone
            let title = String::from("Completed EasyA challenge");
            let proof_hash =
                String::from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
            assert_eq!(contract.add_milestone(title, proof_hash, None, None), Ok(0));

            // Check milestones count and avatar stage
            assert_eq!(contract.get_milestones().len(), 1);
            assert_eq!(contract.get_avatar_stage(), 1);

            // Add another milestone
            let title2 = String::from("Learned Rust");
            let proof_hash2 =
                String::from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
            assert_eq!(contract.add_milestone(title2, proof_hash2, None, None), Ok(1));

            // Check avatar stage increased
            assert_eq!(contract.get_avatar_stage(), 2);

            // Add a third milestone
            let title3 = String::from("Built a dApp");
            let proof_hash3 =
                String::from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
            assert_eq!(contract.add_milestone(title3, proof_hash3, None, None), Ok(2));

            // Check avatar reached maximum stage
            assert_eq!(contract.get_avatar_stage(), 3);

            // Add a fourth milestone
            let title4 = String::from("Won hackathon");
            let proof_hash4 =
                String::from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
            assert_eq!(contract.add_milestone(title4, proof_hash4, None, None), Ok(3));

            // Check avatar still at maximum stage
            assert_eq!(contract.get_avatar_stage(), 3);
        }

        #[ink::test]
        fn test_invalid_hash() {
            // Create contract and mint
            let mut contract = create_minted_contract();

            // Try with invalid hash (too short)
            let title = String::from("Invalid hash");
            let proof_hash = String::from("tooshort");
            assert_eq!(
                contract.add_milestone(title.clone(), proof_hash, None, None),
                Err(ContractError::InvalidProofHash)
            );

            // Try with invalid hash (non-hex characters)
            let proof_hash =
                String::from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdez");
            assert_eq!(
                contract.add_milestone(title, proof_hash, None, None),
                Err(ContractError::InvalidProofHash)
            );
        }

        #[ink::test]
        fn test_not_owner() {
            // Create contract and mint with account 0
            let mut contract = create_minted_contract();

            // Switch to account 1
            let accounts = ink::env::test::default_accounts::<DefaultEnvironment>();
            ink::env::test::set_caller::<DefaultEnvironment>(accounts.bob);

            // Try to add milestone - should fail
            let title = String::from("Milestone from Bob");
            let proof_hash =
                String::from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
            assert_eq!(
                contract.add_milestone(title, proof_hash, None, None),
                Err(ContractError::NotOwner)
            );
        }

        #[ink::test]
        fn test_tip() {
            // Create contract
            let mut contract = Becoming::new();

            // Set up accounts
            let accounts = ink::env::test::default_accounts::<DefaultEnvironment>();

            // Set initial balance to meet minimum requirement
            ink::env::test::set_account_balance::<DefaultEnvironment>(accounts.alice, 2_000_000);
            ink::env::test::set_account_balance::<DefaultEnvironment>(accounts.bob, 1_000_000);

            // Set value to transfer
            ink::env::test::set_value_transferred::<DefaultEnvironment>(50);

            // Send tip from Alice to Bob
            assert_eq!(contract.tip(accounts.bob), Ok(()));

            // Check balances have changed
            assert_eq!(
                ink::env::test::get_account_balance::<DefaultEnvironment>(accounts.bob),
                Ok(1_000_050)
            );
        }
    }
}
