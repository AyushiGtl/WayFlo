use crate::types::{Node, Step};
use std::collections::{HashMap, VecDeque};

pub fn find_path(map: &Vec<Node>, start: usize, end: usize) -> Vec<Step> {
    let mut queue = VecDeque::new();
    let mut visited = HashMap::new();
    let mut parent: HashMap<usize, usize> = HashMap::new();

    queue.push_back(start);
    visited.insert(start, true);

    while let Some(current) = queue.pop_front() {
        if current == end {
            break;
        }

        let node = map.iter().find(|n| n.id == current).unwrap();
        for conn in &node.connections {
            if !visited.contains_key(&conn.to) {
                visited.insert(conn.to, true);
                parent.insert(conn.to, current);
                queue.push_back(conn.to);
            }
        }
    }

    let mut path_ids = vec![end];
    let mut current = end;
    while let Some(&p) = parent.get(&current) {
        path_ids.push(p);
        current = p;
    }
    path_ids.reverse();

    let mut steps = Vec::new();
    for i in 0..path_ids.len() - 1 {
        let from_node = map.iter().find(|n| n.id == path_ids[i]).unwrap();
        let to_node = map.iter().find(|n| n.id == path_ids[i + 1]).unwrap();
        let conn = from_node
            .connections
            .iter()
            .find(|c| c.to == to_node.id)
            .unwrap();

        steps.push(Step {
            from: from_node.name.clone(),
            to: to_node.name.clone(),
            direction: conn.direction.clone(),
            distance: conn.distance,
        });
    }

    steps
}
