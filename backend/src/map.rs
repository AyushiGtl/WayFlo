use std::fs;
use crate::types::Node;

pub fn load_map(file: &str) -> Vec<Node> {
    let data = fs::read_to_string(file).expect("Unable to read file");
    serde_json::from_str(&data).expect("JSON parsing failed")
}
