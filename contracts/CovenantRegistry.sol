// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CovenantRegistry
 * @dev Stores immutable covenant compliance records on the Polygon blockchain
 * @notice This contract creates a tamper-proof audit trail for loan covenant events
 */
contract CovenantRegistry {
    
    // Structure to store compliance event data
    struct ComplianceEvent {
        bytes32 dataHash;       // Keccak256 hash of the compliance data
        uint256 timestamp;      // Block timestamp when sealed
        address sealedBy;       // Address that sealed the record
        string loanId;          // Loan identifier
        string status;          // GREEN, AMBER, or RED
    }
    
    // Mapping from event ID to ComplianceEvent
    mapping(bytes32 => ComplianceEvent) public events;
    
    // Array to track all event IDs
    bytes32[] public eventIds;
    
    // Events
    event ComplianceSealed(
        bytes32 indexed eventId,
        bytes32 dataHash,
        string loanId,
        string status,
        uint256 timestamp,
        address sealedBy
    );
    
    /**
     * @dev Seals a compliance event on the blockchain
     * @param _dataHash Keccak256 hash of the compliance data (off-chain calculation)
     * @param _loanId The loan facility identifier
     * @param _status The compliance status (GREEN, AMBER, RED)
     * @return eventId The unique identifier for this sealed event
     */
    function sealComplianceEvent(
        bytes32 _dataHash,
        string memory _loanId,
        string memory _status
    ) external returns (bytes32 eventId) {
        // Generate unique event ID
        eventId = keccak256(abi.encodePacked(_dataHash, block.timestamp, msg.sender));
        
        // Ensure this event doesn't already exist
        require(events[eventId].timestamp == 0, "Event already exists");
        
        // Store the event
        events[eventId] = ComplianceEvent({
            dataHash: _dataHash,
            timestamp: block.timestamp,
            sealedBy: msg.sender,
            loanId: _loanId,
            status: _status
        });
        
        eventIds.push(eventId);
        
        // Emit event for indexing
        emit ComplianceSealed(
            eventId,
            _dataHash,
            _loanId,
            _status,
            block.timestamp,
            msg.sender
        );
        
        return eventId;
    }
    
    /**
     * @dev Verifies a compliance event exists and matches the provided data hash
     * @param _eventId The event ID to verify
     * @param _dataHash The expected data hash
     * @return valid True if the event exists and hashes match
     */
    function verifyEvent(bytes32 _eventId, bytes32 _dataHash) external view returns (bool valid) {
        ComplianceEvent memory evt = events[_eventId];
        return evt.timestamp > 0 && evt.dataHash == _dataHash;
    }
    
    /**
     * @dev Gets the total number of sealed events
     * @return count The number of events in the registry
     */
    function getEventCount() external view returns (uint256 count) {
        return eventIds.length;
    }
    
    /**
     * @dev Gets event details by ID
     * @param _eventId The event ID to query
     * @return dataHash The compliance data hash
     * @return timestamp When the event was sealed
     * @return sealedBy Who sealed the event
     * @return loanId The loan identifier
     * @return status The compliance status
     */
    function getEvent(bytes32 _eventId) external view returns (
        bytes32 dataHash,
        uint256 timestamp,
        address sealedBy,
        string memory loanId,
        string memory status
    ) {
        ComplianceEvent memory evt = events[_eventId];
        return (evt.dataHash, evt.timestamp, evt.sealedBy, evt.loanId, evt.status);
    }
}
