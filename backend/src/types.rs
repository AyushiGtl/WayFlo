use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct Node {
    pub id: usize,
    pub name: String,
    pub connections: Vec<Connection>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Connection {
    pub to: usize,
    pub distance: u32,
    pub direction: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Step {
    pub from: String,
    pub to: String,
    pub direction: String,
    pub distance: u32,
}
